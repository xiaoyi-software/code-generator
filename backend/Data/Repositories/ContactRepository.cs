using CodeGenerator.Data.Repositories.Interfaces;
using CodeGenerator.Models;
using Microsoft.EntityFrameworkCore;

namespace CodeGenerator.Data.Repositories
{
    public class ContactRepository : Repository<Contact>, IContactRepository
    {
        public ContactRepository(CodeGenDbContext context) : base(context) { }

        public async Task<IEnumerable<Contact>> GetContactsByCustomerAsync(int customerId)
        {
            return await _dbSet
                .Where(c => c.CustomerId == customerId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Contact>> SearchContactsAsync(string searchTerm)
        {
            return await _dbSet
                .Where(c => c.FirstName.Contains(searchTerm) || 
                           c.LastName.Contains(searchTerm) || 
                           c.Email.Contains(searchTerm))
                .ToListAsync();
        }
    }
} 