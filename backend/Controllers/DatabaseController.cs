using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using CodeGenerator.CodeGen;
using CodeGenerator.Data;
using CodeGenerator.Models;
using CodeGenerator.Models.Common;
using CodeGenerator.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using MySqlConnector;
using NPOI.XSSF.UserModel;

namespace CodeGenerator.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DatabaseController : ControllerBase
    {
        private readonly CodeGenDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<DatabaseController> _logger;
        private static readonly SemaphoreSlim _semaphore = new(1, 1);

        public DatabaseController(CodeGenDbContext context, IConfiguration configuration,
            ILogger<DatabaseController> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        // POST: api/Database/UpdateSchema
        [HttpPost("UpdateSchema")]
        public async Task<ActionResult<DynamicMessageResult>> UpdateSchema([FromBody] JsonObject schemaConfig)
        {
            try
            {
                await _semaphore.WaitAsync();
                
                var connectionString = GetDynamicDataConnection();
                using var connection = new MySqlConnection(connectionString);
                await connection.OpenAsync();

                var tables = schemaConfig.AsObject()
                    .Where(p => p.Value is JsonObject)
                    .Select(p => (Name: p.Key, Schema: (JsonObject)p.Value));


                // 获取 DesignTimeModel
                var model = _context.GetService<Microsoft.EntityFrameworkCore.Metadata.IDesignTimeModel>().Model;
                var exceptTables = model.GetEntityTypes().Select(m => m.GetTableName())
                    .ToList();

                foreach (var (tableName, schema) in tables)
                {
                    var tbName = schema["tableName"]?.GetValue<string>();
                    if (string.IsNullOrEmpty(tbName) ||
                        exceptTables.Contains(tbName, StringComparer.OrdinalIgnoreCase))
                        continue;

                    // 获取现有表结构
                    var existingColumns = await GetTableSchemaInternal(tableName, connection);
                    
                    // 解析新的列定义
                    var newColumns = schema["columns"]?.AsArray()
                        .Select(c => new ColumnModel
                        {
                            Name = c["name"]?.GetValue<string>(),
                            DbType = c["dbType"]?.GetValue<string>(),
                            IsNullable = c["isNullable"]?.GetValue<bool>() ?? false,
                            IsPrimaryKey = c["isPrimaryKey"]?.GetValue<bool>() ?? false,
                            IsIdentity = c["isIdentity"]?.GetValue<bool>() ?? false,
                            MaxLength = c["maxLength"]?.GetValue<int?>()
                        })
                        .ToList();

                    if (newColumns == null || !newColumns.Any())
                    {
                        return BadRequest(DynamicMessageResult.Error($"表 {tableName} 的列定义不能为空"));
                    }

                    // 生成DDL语句
                    var ddlCommands = GenerateDDLCommands(tableName, existingColumns, newColumns);
                    
                    // 执行DDL
                    foreach (var ddl in ddlCommands)
                    {
                        using var command = connection.CreateCommand();
                        command.CommandText = ddl;
                        await command.ExecuteNonQueryAsync();
                    }

                    // 保存动态配置
                    await SaveDynamicConfiguration(tableName, schema, connectionString);
                }

                return Ok(DynamicMessageResult.Success("表结构更新成功"));
            }
            catch (Exception ex)
            {
                return BadRequest(DynamicMessageResult.Error($"更新失败：{ex.Message}"));
            }
            finally
            {
                _semaphore.Release();
            }
        }

        // GET: api/Database/GetSchema/{tableName}
        [HttpGet("GetSchema/{tableName}")]
        public async Task<ActionResult<DynamicMessageResult>> GetTableSchema(string tableName)
        {
            try
            {
                var columns = await GetTableSchemaInternal(tableName);
                
                var columnList = columns.Select(c => new
                {
                    name = c.Name,
                    dbType = c.DbType,
                    isNullable = c.IsNullable,
                    isPrimaryKey = c.IsPrimaryKey,
                    isIdentity = c.IsIdentity,
                    maxLength = c.MaxLength,
                    comment = c.Comment
                }).ToList();

                return Ok(DynamicMessageResult.Success("获取成功")
                    .SetData(new { columns = columnList }));
            }
            catch (Exception ex)
            {
                return BadRequest(DynamicMessageResult.Error($"获取表结构失败：{ex.Message}"));
            }
        }

        // GET: api/Database/GetTables
        [HttpGet("GetTables")]
        public async Task<ActionResult<DynamicMessageResult>> GetTables([FromQuery] string keyword)
        {
            try
            {
                var databaseId = CalculateDatabaseId(GetDynamicDataConnection());
                var query = _context.DynamicConfigurations
                    .Where(x => x.DatabaseId == databaseId)
                    .AsQueryable();

                // 如果有关键字，进行过滤
                if (!string.IsNullOrWhiteSpace(keyword))
                {
                    query = query.Where(x => 
                        x.TableName.Contains(keyword) || 
                        EF.Functions.JsonContains(x.Configuration, $"\"name\":\"{keyword}\""));
                }

                // 先获取数据
                var configs = await query.ToListAsync();
                
                // 然后在内存中处理
                var tables = configs.Select(x => new
                {
                    name = x.TableName,
                    label = GetConfigValue(x.Configuration, "tableName") ?? x.TableName,
                    description = GetConfigValue(x.Configuration, "comment")
                }).ToList();

                return Ok(DynamicMessageResult.Success("获取成功")
                    .SetData(new { items = tables }));
            }
            catch (Exception ex)
            {
                return BadRequest(DynamicMessageResult.Error($"获取表列表失败：{ex.Message}"));
            }
        }

        // 辅助方法：从配置中获取值（改为静态方法）
        private static string GetConfigValue(string configuration, string key)
        {
            try
            {
                var config = JsonSerializer.Deserialize<JsonObject>(configuration);
                return config?[key]?.GetValue<string>();
            }
            catch
            {
                return null;
            }
        }

        // 重命名原来的 GetTableSchema 方法为 GetTableSchemaInternal
        private async Task<List<ColumnModel>> GetTableSchemaInternal(string tableName, MySqlConnection connection = null)
        {
            var sql = @"
                SELECT 
                    COLUMN_NAME,
                    COLUMN_TYPE,
                    IS_NULLABLE,
                    COLUMN_KEY,
                    EXTRA,
                    CHARACTER_MAXIMUM_LENGTH,
                    NUMERIC_PRECISION,
                    COLUMN_COMMENT
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = @SchemaName 
                AND TABLE_NAME = @TableName";

            var columns = new List<ColumnModel>();
            var schemaName = connection?.Database ?? _configuration.GetConnectionString("DynamicDataConnection")
                ?.Split(';')
                .FirstOrDefault(x => x.ToLower().StartsWith("database="))
                ?.Split('=')[1];

            if (string.IsNullOrEmpty(schemaName))
            {
                throw new InvalidOperationException("无法获取数据库名称");
            }

            var shouldDisposeConnection = connection == null;
            if (connection == null)
            {
                connection = new MySqlConnection(GetDynamicDataConnection());
                await connection.OpenAsync();
            }

            try
            {
                using var command = connection.CreateCommand();
                command.CommandText = sql;
                command.Parameters.AddWithValue("@SchemaName", schemaName);
                command.Parameters.AddWithValue("@TableName", tableName);

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    long? maxLength = null;
                    var maxLengthOrdinal = reader.GetOrdinal("CHARACTER_MAXIMUM_LENGTH");

                    if (!reader.IsDBNull(maxLengthOrdinal))
                    {
                        try
                        {
                            var value = reader.GetValue(maxLengthOrdinal);
                            if (value is long longValue)
                            {
                                maxLength = longValue;
                            }
                            else if (value is int intValue)
                            {
                                maxLength = intValue;
                            }
                        }
                        catch
                        {
                            maxLength = null;
                        }
                    }

                    columns.Add(new ColumnModel
                    {
                        Name = reader.GetString(0),
                        DbType = reader.GetString(1),  // COLUMN_TYPE 包含完整类型定义
                        IsNullable = reader.GetString(2) == "YES",
                        IsPrimaryKey = reader.GetString(3) == "PRI",
                        IsIdentity = reader.GetString(4).Contains("auto_increment"),
                        MaxLength = maxLength,
                        Comment = reader.GetString("COLUMN_COMMENT")
                    });
                }
            }
            finally
            {
                if (shouldDisposeConnection)
                {
                    await connection.DisposeAsync();
                }
            }

            return columns;
        }
        
        private List<string> GenerateDDLCommands(string tableName, List<ColumnModel> existing, List<ColumnModel> newColumns)
        {
            var commands = new List<string>();

            // 如果表不存在，创建表
            if (!existing.Any())
            {
                commands.Add(GenerateCreateTableSQL(tableName, newColumns));
                return commands;
            }

            // 需要删除的列
            var columnsToDelete = existing
                .Where(e => !newColumns.Any(n => n.Name == e.Name))
                .Select(c => c.Name);

            // 需要添加的列
            var columnsToAdd = newColumns
                .Where(n => !existing.Any(e => e.Name == n.Name));

            // 需要修改的列
            var columnsToModify = newColumns
                .Where(n => existing.Any(e => e.Name == n.Name && 
                    (e.DbType != n.DbType || 
                     e.IsNullable != n.IsNullable)));

            // 生成DDL语句
            foreach (var column in columnsToDelete)
            {
                commands.Add($"ALTER TABLE `{tableName}` DROP COLUMN `{column}`;");
            }

            foreach (var column in columnsToAdd)
            {
                commands.Add($"ALTER TABLE `{tableName}` ADD COLUMN {GenerateColumnDefinition(column)};");
            }

            foreach (var column in columnsToModify)
            {
                commands.Add($"ALTER TABLE `{tableName}` MODIFY COLUMN {GenerateColumnDefinition(column)};");
            }

            return commands;
        }

        private string GenerateCreateTableSQL(string tableName, List<ColumnModel> columns)
        {
            var sql = new StringBuilder();
            sql.AppendLine($"CREATE TABLE IF NOT EXISTS `{tableName}` (");

            var columnDefinitions = new List<string>();
            var primaryKey = columns.FirstOrDefault(c => c.IsPrimaryKey)?.Name;

            foreach (var column in columns)
            {
                var definition = new StringBuilder();
                definition.Append($"    `{column.Name}` {column.DbType}");

                // 处理可空性
                if (!column.IsNullable)
                {
                    definition.Append(" NOT NULL");
                }

                // 处理自增
                if (column.IsIdentity)
                {
                    definition.Append(" AUTO_INCREMENT");
                }

                columnDefinitions.Add(definition.ToString());
            }

            // 添加列定义
            sql.AppendLine(string.Join(",\n", columnDefinitions));

            // 添加主键约束
            if (!string.IsNullOrEmpty(primaryKey))
            {
                sql.AppendLine($"    ,PRIMARY KEY (`{primaryKey}`)");
            }

            sql.AppendLine(") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

            // 输出SQL用于调试
            System.Diagnostics.Debug.WriteLine(sql.ToString());
            
            return sql.ToString();
        }

        private string GenerateColumnDefinition(ColumnModel column)
        {
            var definition = new StringBuilder();
            definition.Append($"`{column.Name}` {column.DbType}");

            // 处理可空性
            if (!column.IsNullable)
            {
                definition.Append(" NOT NULL");
            }

            // 处理自增
            if (column.IsIdentity)
            {
                definition.Append(" AUTO_INCREMENT");
            }

            return definition.ToString();
        }

        private async Task SaveDynamicConfiguration(string tableName, JsonObject schema, string connectionString = null)
        {
            connectionString ??= GetDynamicDataConnection();
            var databaseId = CalculateDatabaseId(connectionString);

            var config = await _context.DynamicConfigurations
                .FirstOrDefaultAsync(d => d.TableName == tableName);

            if (config == null)
            {
                config = new DynamicConfiguration
                {
                    TableName = tableName,
                    Configuration = schema.ToJsonString(),
                    DatabaseId = databaseId,  // 设置DatabaseId
                    CreatedAt = DateTime.UtcNow
                };
                _context.DynamicConfigurations.Add(config);
            }
            else
            {
                config.Configuration = schema.ToJsonString();
                config.DatabaseId = databaseId;  // 更新DatabaseId
                config.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        // 动态查询数据
        [HttpGet("Query")]
        public async Task<ActionResult<DynamicMessageResult>> Query([FromQuery] DynamicDataSearchDto searchDto)
        {
            try
            {
                using var connection = new MySqlConnection(GetDynamicDataConnection());
                await connection.OpenAsync();

                var sql = new StringBuilder($"SELECT * FROM `{searchDto.TableName}`");
                var parameters = new List<MySqlParameter>();
                var conditions = new List<string>();

                // 构建 WHERE 子句
                if (searchDto.Filters?.Any() == true)
                {
                    // 检查字段是否存在
                    var columns = await GetTableSchemaInternal(searchDto.TableName, connection);
                    foreach (var filter in searchDto.Filters.Where(f => !string.IsNullOrEmpty(f.Value)))
                    {
                        if (columns.Any(c => c.Name == filter.Key))
                        {
                            conditions.Add($"`{filter.Key}` LIKE @{filter.Key}");
                            parameters.Add(new MySqlParameter($"@{filter.Key}", $"%{filter.Value}%"));
                        }
                    }
                    if (conditions.Any())
                    {
                        sql.Append(" WHERE " + string.Join(" AND ", conditions));
                    }
                }

                // 处理排序
                if (!string.IsNullOrEmpty(searchDto.SortsJson))
                {
                    try
                    {
                        var sorts = JsonSerializer.Deserialize<List<DynamicDataSortItem>>(
                            searchDto.SortsJson,
                            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                        );
                        
                        if (sorts?.Any() == true)
                        {
                            var orderClauses = new List<string>();
                            foreach (var sort in sorts)
                            {
                                // 验证字段是否存在
                                var columns = await GetTableSchemaInternal(searchDto.TableName, connection);
                                if (columns.Any(c => c.Name == sort.Field))
                                {
                                    var direction = sort.Order?.ToLower() == "desc" ? "DESC" : "ASC";
                                    orderClauses.Add($"`{sort.Field}` {direction}");
                                }
                            }
                            if (orderClauses.Any())
                            {
                                sql.Append(" ORDER BY " + string.Join(", ", orderClauses));
                            }
                        }
                    }
                    catch (JsonException ex)
                    {
                        _logger.LogWarning(ex, "Failed to parse sort parameters");
                    }
                }

                // 获取总记录数
                var countSql = new StringBuilder($"SELECT COUNT(*) FROM `{searchDto.TableName}`");
                if (conditions.Any())
                {
                    countSql.Append(" WHERE " + string.Join(" AND ", conditions));
                }

                var total = 0;
                using var command = connection.CreateCommand();
                command.CommandText = countSql.ToString();
                command.Parameters.AddRange(parameters.ToArray());

                var result = await command.ExecuteScalarAsync();
                total = Convert.ToInt32(result);

                // 添加分页
                sql.Append($" LIMIT {(searchDto.PageIndex - 1) * searchDto.PageSize}, {searchDto.PageSize}");

                // 执行查询
                var data = new List<Dictionary<string, object>>();
                var queryCommand = connection.CreateCommand();
                queryCommand.CommandText = sql.ToString();
                queryCommand.Parameters.AddRange(parameters.ToArray());

                using var reader = await queryCommand.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var row = new Dictionary<string, object>();
                    for (var i = 0; i < reader.FieldCount; i++)
                    {
                        row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
                    }
                    data.Add(row);
                }

                return Ok(DynamicMessageResult.Success("查询成功")
                    .SetData(new { items = data, total }));
            }
            catch (Exception ex)
            {
                return BadRequest(DynamicMessageResult.Error($"查询失败：{ex.Message}"));
            }
        }

        // 动态新增数据
        [HttpPost("{tableName}")]
        public async Task<ActionResult<DynamicMessageResult>> Create(
            string tableName,
            [FromBody] Dictionary<string, object> data)
        {
            try
            {
                using var connection = new MySqlConnection(GetDynamicDataConnection());
                await connection.OpenAsync();

                // 获取表结构
                var columns = await GetTableSchemaInternal(tableName, connection);
                var columnNames = columns.Select(c => c.Name).ToList();

                // 添加审计字段（如果表中存在这些字段）
                var auditFields = new Dictionary<string, object>
                {
                    ["CreatedAt"] = DateTime.UtcNow,
                    ["CreationTime"] = DateTime.UtcNow,
                    ["CreatorId"] = User.Identity?.Name ?? "system",
                    ["UpdatedAt"] = null,
                    ["LastModificationTime"] = null,
                    ["LastModifierId"] = null
                };

                foreach (var field in auditFields)
                {
                    if (columnNames.Contains(field.Key))
                    {
                        data[field.Key] = field.Value;
                    }
                }

                // 过滤掉不存在的字段并转换数据类型
                var validData = new Dictionary<string, object>();
                foreach (var kv in data)
                {
                    if (!columnNames.Contains(kv.Key)) continue;

                    var column = columns.First(c => c.Name == kv.Key);
                    var value = ConvertToDbValue(kv.Value, column.DbType);
                    if (value != null)
                    {
                        validData[kv.Key] = value;
                    }
                }

                if (!validData.Any())
                {
                    return BadRequest(DynamicMessageResult.Error("没有有效的字段数据"));
                }

                var columnList = validData.Keys.Select(k => $"`{k}`");
                var paramList = validData.Keys.Select(k => $"@{k}");
                var sql = $"INSERT INTO `{tableName}` ({string.Join(", ", columnList)}) VALUES ({string.Join(", ", paramList)})";

                var parameters = validData.Select(kv => new MySqlParameter($"@{kv.Key}", kv.Value ?? DBNull.Value)).ToArray();
                using var command = connection.CreateCommand();
                command.CommandText = sql;
                command.Parameters.AddRange(parameters);
                await command.ExecuteNonQueryAsync();

                return Ok(DynamicMessageResult.Success("创建成功"));
            }
            catch (Exception ex)
            {
                return BadRequest(DynamicMessageResult.Error($"创建失败：{ex.Message}"));
            }
        }

        // 动态更新数据
        [HttpPut("{tableName}")]
        public async Task<ActionResult<DynamicMessageResult>> Update(
            string tableName,
            [FromBody] Dictionary<string, object> data)
        {
            try
            {
                using var connection = new MySqlConnection(GetDynamicDataConnection());
                await connection.OpenAsync();

                var columns = await GetTableSchemaInternal(tableName, connection);
                var columnNames = columns.Select(c => c.Name).ToList();
                
                // 获取所有主键列
                var pkColumns = columns.Where(c => c.IsPrimaryKey).ToList();
                if (!pkColumns.Any())
                {
                    return BadRequest(DynamicMessageResult.Error("未找到主键列"));
                }

                // 验证是否提供了所有主键值
                var pkValues = new Dictionary<string, object>();
                foreach (var pk in pkColumns)
                {
                    if (!data.ContainsKey(pk.Name))
                    {
                        return BadRequest(DynamicMessageResult.Error($"缺少主键值：{pk.Name}"));
                    }
                    var value = ConvertToDbValue(data[pk.Name], pk.DbType);
                    if (value == null)
                    {
                        return BadRequest(DynamicMessageResult.Error($"无效的主键值：{pk.Name}"));
                    }
                    pkValues[pk.Name] = value;
                    data.Remove(pk.Name); // 从更新数据中移除主键
                }

                // 添加审计字段
                var auditFields = new Dictionary<string, object>
                {
                    ["UpdatedAt"] = DateTime.UtcNow,
                    ["LastModificationTime"] = DateTime.UtcNow,
                    ["LastModifierId"] = User.Identity?.Name ?? "system"
                };

                foreach (var field in auditFields)
                {
                    if (columnNames.Contains(field.Key))
                    {
                        data[field.Key] = field.Value;
                    }
                }

                // 移除不可修改的字段
                var readOnlyFields = new[]
                {
                    "CreatedAt",
                    "CreationTime",
                    "CreatorId"
                };

                foreach (var field in readOnlyFields)
                {
                    data.Remove(field);
                }

                // 过滤掉不存在的字段并转换数据类型
                var validData = new Dictionary<string, object>();
                foreach (var kv in data)
                {
                    if (!columnNames.Contains(kv.Key) || readOnlyFields.Contains(kv.Key)) continue;

                    var column = columns.First(c => c.Name == kv.Key);
                    var value = ConvertToDbValue(kv.Value, column.DbType);
                    if (value != null)
                    {
                        validData[kv.Key] = value;
                    }
                }

                if (!validData.Any())
                {
                    return BadRequest(DynamicMessageResult.Error("没有有效的字段数据"));
                }

                // 构建 WHERE 子句
                var whereConditions = pkValues.Select(kv => $"`{kv.Key}` = @pk_{kv.Key}");
                var sql = $"UPDATE `{tableName}` SET {string.Join(", ", validData.Select(kv => $"`{kv.Key}` = @{kv.Key}"))} WHERE {string.Join(" AND ", whereConditions)}";

                // 合并主键参数和数据参数
                var parameters = validData.Select(kv => new MySqlParameter($"@{kv.Key}", kv.Value ?? DBNull.Value))
                    .Concat(pkValues.Select(kv => new MySqlParameter($"@pk_{kv.Key}", kv.Value)))
                    .ToArray();

                using var command = connection.CreateCommand();
                command.CommandText = sql;
                command.Parameters.AddRange(parameters);
                await command.ExecuteNonQueryAsync();

                return Ok(DynamicMessageResult.Success("更新成功"));
            }
            catch (Exception ex)
            {
                return BadRequest(DynamicMessageResult.Error($"更新失败：{ex.Message}"));
            }
        }

        // 动态删除数据
        [HttpDelete("{tableName}")]
        public async Task<ActionResult<DynamicMessageResult>> Delete(string tableName, [FromQuery] Dictionary<string, string> keys)
        {
            try
            {
                using var connection = new MySqlConnection(GetDynamicDataConnection());
                await connection.OpenAsync();

                var columns = await GetTableSchemaInternal(tableName, connection);
                var pkColumns = columns.Where(c => c.IsPrimaryKey).ToList();
                
                if (!pkColumns.Any())
                {
                    return BadRequest(DynamicMessageResult.Error("未找到主键列"));
                }

                // 验证并转换主键值
                var pkValues = new Dictionary<string, object>();
                foreach (var pk in pkColumns)
                {
                    if (!keys.ContainsKey(pk.Name))
                    {
                        return BadRequest(DynamicMessageResult.Error($"缺少主键值：{pk.Name}"));
                    }
                    var value = ConvertToDbValue(keys[pk.Name], pk.DbType);
                    if (value == null)
                    {
                        return BadRequest(DynamicMessageResult.Error($"无效的主键值：{pk.Name}"));
                    }
                    pkValues[pk.Name] = value;
                }

                var whereConditions = pkValues.Select(kv => $"`{kv.Key}` = @{kv.Key}");
                var sql = $"DELETE FROM `{tableName}` WHERE {string.Join(" AND ", whereConditions)}";

                using var command = connection.CreateCommand();
                command.CommandText = sql;
                foreach (var kv in pkValues)
                {
                    command.Parameters.AddWithValue($"@{kv.Key}", kv.Value);
                }
                await command.ExecuteNonQueryAsync();

                return Ok(DynamicMessageResult.Success("删除成功"));
            }
            catch (Exception ex)
            {
                return BadRequest(DynamicMessageResult.Error($"删除失败：{ex.Message}"));
            }
        }

        // 修改 ConvertToDbValue 方法
        private object ConvertToDbValue(object value, string dbType)
        {
            if (value == null) return null;

            try
            {
                // 如果是 JsonElement，先获取其原始值
                if (value is JsonElement element)
                {
                    value = element.ValueKind switch
                    {
                        JsonValueKind.String => element.GetString(),
                        JsonValueKind.Number when dbType.Contains("int") => element.GetInt32(),
                        JsonValueKind.Number when dbType.Contains("decimal") || dbType.Contains("double") => element.GetDouble(),
                        JsonValueKind.True or JsonValueKind.False => element.GetBoolean(),
                        JsonValueKind.Null => null,
                        _ => element.ToString()
                    };
                }

                // 根据数据库类型进行转换
                return dbType switch
                {
                    var t when t.Contains("int") => Convert.ToInt32(value),
                    var t when t.Contains("decimal") || t.Contains("double") => Convert.ToDouble(value),
                    var t when t.Contains("datetime") => value is DateTime dt ? dt : DateTime.Parse(value.ToString()),
                    var t when t.Contains("bit") || t.Contains("bool") => Convert.ToBoolean(value),
                    _ => value.ToString()
                };
            }
            catch
            {
                return null;
            }
        }

        // POST: api/Database/ImportSchema
        [HttpPost("ImportSchema")]
        public async Task<ActionResult<DynamicMessageResult>> ImportSchema([FromBody] JsonObject schemaConfig)
        {
            try
            {
                await _semaphore.WaitAsync();
                
                var connectionString = GetDynamicDataConnection();
                using var connection = new MySqlConnection(connectionString);
                await connection.OpenAsync();

                var tables = schemaConfig.AsObject()
                    .Where(p => p.Value is JsonObject)
                    .Select(p => (Name: p.Key, Schema: (JsonObject)p.Value));

                // 获取 DesignTimeModel
                var model = _context.GetService<Microsoft.EntityFrameworkCore.Metadata.IDesignTimeModel>().Model;
                var exceptTables = model.GetEntityTypes().Select(m => m.GetTableName())
                    .ToList();

                foreach (var (tableName, schema) in tables)
                {
                    var tbName = schema["tableName"]?.GetValue<string>();
                    if (string.IsNullOrEmpty(tbName) ||
                        exceptTables.Contains(tbName, StringComparer.OrdinalIgnoreCase))
                        continue;

                    // 仅保存动态配置，不修改数据库结构
                    await SaveDynamicConfiguration(tableName, schema, connectionString);
                }

                return Ok(DynamicMessageResult.Success("架构导入成功"));
            }
            catch (Exception ex)
            {
                return BadRequest(DynamicMessageResult.Error($"导入失败：{ex.Message}"));
            }
            finally
            {
                _semaphore.Release();
            }
        }

        // 修改获取动态连接字符串的方法
        private string GetDynamicDataConnection()
        {
            var connectionString = _configuration.GetConnectionString("DynamicDataConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("未配置动态数据连接字符串(DynamicDataConnection)");
            }
            return connectionString;
        }

        // 添加一个私有方法来计算DatabaseId
        private string CalculateDatabaseId(string connectionString)
        {
            return Convert.ToBase64String(
                System.Security.Cryptography.SHA256.HashData(
                    Encoding.UTF8.GetBytes(connectionString ?? string.Empty)
                )
            );
        }

        // GET: api/Database/GetTableColumns/{tableName}
        [HttpGet("GetTableColumns/{tableName}")]
        public async Task<ActionResult<DynamicMessageResult>> GetTableColumns(string tableName)
        {
            try
            {
                var databaseId = CalculateDatabaseId(GetDynamicDataConnection());
                var config = await _context.DynamicConfigurations
                    .Include(d => d.TableColumns)
                    .FirstOrDefaultAsync(d => d.TableName == tableName && d.DatabaseId == databaseId);

                if (config == null)
                {
                    return NotFound(DynamicMessageResult.Error("未找到表配置"));
                }

                // 解析表配置
                var schemaModel = JsonSerializer.Deserialize<SchemaModel>(config.Configuration);
                if (schemaModel?.Columns == null || !schemaModel.Columns.Any())
                {
                    return BadRequest(DynamicMessageResult.Error("表配置无效"));
                }

                // 获取现有的列配置
                var existingColumns = config.TableColumns?.ToDictionary(c => c.ColumnName) ?? new Dictionary<string, DynamicTableColumn>();

                // 合并配置，以表结构为准
                var mergedColumns = schemaModel.Columns.Select(col => {
                    // 尝试获取现有配置
                    existingColumns.TryGetValue(col.Name, out var existingColumn);

                    return new DynamicTableColumn
                    {
                        DynamicConfigurationId = config.Id,
                        ColumnName = col.Name,
                        DisplayName = existingColumn?.DisplayName ?? col.Name, // 如果没有显示名称，使用列名
                        IsSortable = existingColumn?.IsSortable ?? false,
                        IsVisible = existingColumn?.IsVisible ?? true,
                        OrderIndex = existingColumn?.OrderIndex ?? 0,
                        Description = existingColumn?.Description ?? col.Comment // 如果没有描述，使用列的注释
                    };
                }).ToList();

                return Ok(DynamicMessageResult.Success("获取成功")
                    .SetData(new { columns = mergedColumns }));
            }
            catch (Exception ex)
            {
                return BadRequest(DynamicMessageResult.Error($"获取列配置失败：{ex.Message}"));
            }
        }

        // POST: api/Database/SaveTableColumns/{tableName}
        [HttpPost("SaveTableColumns/{tableName}")]
        public async Task<ActionResult<DynamicMessageResult>> SaveTableColumns(
            string tableName, 
            [FromBody] List<DynamicTableColumn> columns)
        {
            try
            {
                var databaseId = CalculateDatabaseId(GetDynamicDataConnection());
                var config = await _context.DynamicConfigurations
                    .Include(d => d.TableColumns)
                    .FirstOrDefaultAsync(d => d.TableName == tableName && d.DatabaseId == databaseId);

                if (config == null)
                {
                    return NotFound(DynamicMessageResult.Error("未找到表配置"));
                }

                // 解析表配置
                var schemaModel = JsonSerializer.Deserialize<SchemaModel>(config.Configuration);
                if (schemaModel?.Columns == null || !schemaModel.Columns.Any())
                {
                    return BadRequest(DynamicMessageResult.Error("表配置无效"));
                }

                // 将提交的列配置转换为字典，方便查找
                var submittedColumns = columns?.ToDictionary(c => c.ColumnName) ?? new Dictionary<string, DynamicTableColumn>();

                // 删除现有列配置
                if (config.TableColumns != null)
                {
                    _context.RemoveRange(config.TableColumns);
                }

                // 以表结构为准，合并配置
                config.TableColumns = schemaModel.Columns.Select(col => {
                    // 尝试获取提交的配置
                    submittedColumns.TryGetValue(col.Name, out var submittedColumn);

                    return new DynamicTableColumn
                    {
                        DynamicConfigurationId = config.Id,
                        ColumnName = col.Name,
                        DisplayName = submittedColumn?.DisplayName ?? col.Name, // 如果没有显示名称，使用列名
                        IsSortable = submittedColumn?.IsSortable ?? false,
                        IsVisible = submittedColumn?.IsVisible ?? true,
                        OrderIndex = submittedColumn?.OrderIndex ?? 0,
                        Description = submittedColumn?.Description ?? col.Comment // 如果没有描述，使用列的注释
                    };
                }).ToList();

                await _context.SaveChangesAsync();

                return Ok(DynamicMessageResult.Success("保存成功"));
            }
            catch (Exception ex)
            {
                return BadRequest(DynamicMessageResult.Error($"保存列配置失败：{ex.Message}"));
            }
        }

        // POST: api/Database/Export
        [HttpPost("Export")]
        public async Task<IActionResult> Export([FromBody] DynamicDataExportDto exportDto)
        {
            try
            {
                using var connection = new MySqlConnection(GetDynamicDataConnection());
                await connection.OpenAsync();

                var sql = new StringBuilder($"SELECT * FROM `{exportDto.TableName}`");
                var parameters = new List<MySqlParameter>();
                var conditions = new List<string>();

                // 构建 WHERE 子句
                if (exportDto.Filters?.Any() == true)
                {
                    // 检查字段是否存在
                    var columns = await GetTableSchemaInternal(exportDto.TableName, connection);
                    foreach (var filter in exportDto.Filters.Where(f => !string.IsNullOrEmpty(f.Value)))
                    {
                        if (columns.Any(c => c.Name == filter.Key))
                        {
                            conditions.Add($"`{filter.Key}` LIKE @{filter.Key}");
                            parameters.Add(new MySqlParameter($"@{filter.Key}", $"%{filter.Value}%"));
                        }
                    }
                    if (conditions.Any())
                    {
                        sql.Append(" WHERE " + string.Join(" AND ", conditions));
                    }
                }

                // 处理排序
                if (!string.IsNullOrEmpty(exportDto.SortsJson))
                {
                    try
                    {
                        var sorts = JsonSerializer.Deserialize<List<DynamicDataSortItem>>(
                            exportDto.SortsJson,
                            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                        );
                        
                        if (sorts?.Any() == true)
                        {
                            var orderClauses = new List<string>();
                            foreach (var sort in sorts)
                            {
                                var columns = await GetTableSchemaInternal(exportDto.TableName, connection);
                                if (columns.Any(c => c.Name == sort.Field))
                                {
                                    var direction = sort.Order?.ToLower() == "desc" ? "DESC" : "ASC";
                                    orderClauses.Add($"`{sort.Field}` {direction}");
                                }
                            }
                            if (orderClauses.Any())
                            {
                                sql.Append(" ORDER BY " + string.Join(", ", orderClauses));
                            }
                        }
                    }
                    catch (JsonException ex)
                    {
                        _logger.LogWarning(ex, "Failed to parse sort parameters");
                    }
                }

                // 执行查询
                var data = new List<Dictionary<string, object>>();
                var queryCommand = connection.CreateCommand();
                queryCommand.CommandText = sql.ToString();
                queryCommand.Parameters.AddRange(parameters.ToArray());

                using var reader = await queryCommand.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var row = new Dictionary<string, object>();
                    for (var i = 0; i < reader.FieldCount; i++)
                    {
                        row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
                    }
                    data.Add(row);
                }

                // 使用 NPOI 创建 Excel
                using var workbook = new XSSFWorkbook();
                var sheet = workbook.CreateSheet("Sheet1");

                // 创建标题行
                var headerRow = sheet.CreateRow(0);
                var columnIndex = 0;
                var exportColumns = exportDto.Columns.Where(c => c.IsVisible).OrderBy(c => c.OrderIndex);
                
                foreach (var column in exportColumns)
                {
                    var cell = headerRow.CreateCell(columnIndex++);
                    cell.SetCellValue(column.DisplayName ?? column.ColumnName);
                }

                // 填充数据行
                var rowIndex = 1;
                foreach (var item in data)
                {
                    var row = sheet.CreateRow(rowIndex++);
                    columnIndex = 0;
                    
                    foreach (var column in exportColumns)
                    {
                        var cell = row.CreateCell(columnIndex++);
                        var value = item.GetValueOrDefault(column.ColumnName);
                        
                        if (value != null)
                        {
                            // 根据数据类型设置单元格值
                            switch (value)
                            {
                                case DateTime dateTime:
                                    cell.SetCellValue(dateTime.ToString("yyyy-MM-dd HH:mm:ss"));
                                    break;
                                case bool boolean:
                                    cell.SetCellValue(boolean);
                                    break;
                                case double number:
                                    cell.SetCellValue(number);
                                    break;
                                default:
                                    cell.SetCellValue(value.ToString());
                                    break;
                            }
                        }
                    }
                }

                // 自动调整列宽
                for (int i = 0; i < exportColumns.Count(); i++)
                {
                    sheet.AutoSizeColumn(i);
                }

                // 将工作簿写入内存流
                using var ms = new MemoryStream();
                workbook.Write(ms, true);
                ms.Seek(0, SeekOrigin.Begin);

                // 返回文件
                return File(
                    ms.ToArray(),
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"{exportDto.TableName}_{DateTime.Now:yyyyMMddHHmmss}.xlsx"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Export failed");
                return BadRequest(new { message = $"导出失败：{ex.Message}" });
            }
        }
    }
}