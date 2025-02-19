using CodeGenerator.Models;

namespace CodeGenerator.Data.Repositories.Interfaces;
public interface ICustomerRepository : IRepository<Customer>
{
    Task<IEnumerable<Customer>> GetCustomersWithContactsAsync();
    Task<IEnumerable<Customer>> SearchCustomersAsync(string searchTerm);
}