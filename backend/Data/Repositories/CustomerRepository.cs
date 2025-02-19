using CodeGenerator.Data.Repositories.Interfaces;
using CodeGenerator.Models;
using Microsoft.EntityFrameworkCore;

namespace CodeGenerator.Data.Repositories;

public class CustomerRepository : Repository<Customer>, ICustomerRepository
{
    public CustomerRepository(CodeGenDbContext context) : base(context) { }

    public async Task<IEnumerable<Customer>> GetCustomersWithContactsAsync()
    {
        return await _dbSet
            .Include(c => c.Contacts)
            .ToListAsync();
    }

    public async Task<IEnumerable<Customer>> SearchCustomersAsync(string searchTerm)
    {
        return await _dbSet
            .Where(c => c.Name.Contains(searchTerm) || 
                        c.Industry.Contains(searchTerm))
            .ToListAsync();
    }
}