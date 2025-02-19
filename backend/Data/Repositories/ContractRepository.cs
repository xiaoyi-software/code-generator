using CodeGenerator.Data.Repositories.Interfaces;
using CodeGenerator.Models;
using Microsoft.EntityFrameworkCore;

namespace CodeGenerator.Data.Repositories
{
    public class ContractRepository : Repository<Contract>, IContractRepository
    {
        public ContractRepository(CodeGenDbContext context) : base(context) { }

        public async Task<IEnumerable<Contract>> GetContractsByCustomerAsync(int customerId)
        {
            return await _dbSet
                .Where(c => c.CustomerId == customerId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Contract>> GetActiveContractsAsync()
        {
            return await _dbSet
                .Where(c => c.Status == ContractStatus.Active.ToString())
                .ToListAsync();
        }

        public async Task<decimal> GetTotalContractValueAsync()
        {
            return await _dbSet
                .Where(c => c.Status == ContractStatus.Active.ToString())
                .SumAsync(c => c.Value);
        }
    }
} 