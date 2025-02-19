using CodeGenerator.Models;

namespace CodeGenerator.Data.Repositories.Interfaces
{
    public interface IContactRepository : IRepository<Contact>
    {
        Task<IEnumerable<Contact>> GetContactsByCustomerAsync(int customerId);
        Task<IEnumerable<Contact>> SearchContactsAsync(string searchTerm);
    }
}