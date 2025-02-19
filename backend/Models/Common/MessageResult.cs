namespace CodeGenerator.Models.Common
{
    /// <summary>
    /// 统一的API返回结果包装类
    /// </summary>
    /// <typeparam name="T">返回数据的类型</typeparam>
    public class MessageResult<T>
    {
        /// <summary>
        /// 状态码
        /// </summary>
        public int Status { get; set; }

        /// <summary>
        /// 消息
        /// </summary>
        public string Message { get; set; }

        /// <summary>
        /// 数据
        /// </summary>
        public T Data { get; set; }

        public MessageResult<T> SetData(T data)
        {
            this.Data = data;
            return this;
        }
    }

    /// <summary>
    /// 不带数据的消息结果
    /// </summary>
    public class MessageResult : MessageResult<object>
    {
        /// <summary>
        /// 创建成功的返回结果
        /// </summary>
        public static MessageResult Success(string message = "success")
        {
            return new MessageResult
            {
                Status = 0,
                Message = message,
                Data = null
            };
        }
        
        /// <summary>
        /// 创建失败的返回结果
        /// </summary>
        public static MessageResult Error(string message, int status = -1)
        {
            return new MessageResult
            {
                Status = status,
                Message = message,
                Data = null
            };
        }

        public static MessageResult<TData> Success<TData>(string message = "success")
        {
            return new MessageResult<TData>()
            {
                Status = 0,
                Message = message,
                Data = default(TData)
            };
        }

        public static MessageResult<TData> Error<TData>(string message, int status = -1)
        {
            return new MessageResult<TData>()
            {
                Status = status,
                Message = message,
                Data = default(TData)
            };
        }
    }
} 