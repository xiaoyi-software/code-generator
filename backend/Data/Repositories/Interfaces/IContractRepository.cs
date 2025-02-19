using CodeGenerator.Models;

namespace CodeGenerator.Data.Repositories.Interfaces;

public interface IContractRepository : IRepository<Contract>
{
    Task<IEnumerable<Contract>> GetContractsByCustomerAsync(int customerId);
    Task<IEnumerable<Contract>> GetActiveContractsAsync();
    Task<decimal> GetTotalContractValueAsync();
}