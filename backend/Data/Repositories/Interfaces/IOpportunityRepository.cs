using CodeGenerator.Models;

namespace CodeGenerator.Data.Repositories.Interfaces;

public interface IOpportunityRepository : IRepository<Opportunity>
{
    Task<IEnumerable<Opportunity>> GetOpportunitiesByCustomerAsync(int customerId);
    Task<IEnumerable<Opportunity>> GetOpportunitiesByStatusAsync(OpportunityStatus status);
}