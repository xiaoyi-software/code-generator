using CodeGenerator.Data.Repositories.Interfaces;
using CodeGenerator.Models;
using Microsoft.EntityFrameworkCore;

namespace CodeGenerator.Data.Repositories
{
    public class OpportunityRepository : Repository<Opportunity>, IOpportunityRepository
    {
        public OpportunityRepository(CodeGenDbContext context) : base(context) { }

        public async Task<IEnumerable<Opportunity>> GetOpportunitiesByCustomerAsync(int customerId)
        {
            return await _dbSet
                .Where(o => o.CustomerId == customerId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Opportunity>> GetOpportunitiesByStatusAsync(OpportunityStatus status)
        {
            return await _dbSet
                .Where(o => o.Status == status.ToString())
                .ToListAsync();
        }
    }
} 