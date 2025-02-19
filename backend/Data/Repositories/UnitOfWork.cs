using CodeGenerator.Data.Repositories.Interfaces;

namespace CodeGenerator.Data.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly CodeGenDbContext _context;
    private ICustomerRepository _customerRepository;
    private IContactRepository _contactRepository;
    private IOpportunityRepository _opportunityRepository;
    private IContractRepository _contractRepository;

    public UnitOfWork(CodeGenDbContext context)
    {
        _context = context;
    }

    public ICustomerRepository Customers => 
        _customerRepository ??= new CustomerRepository(_context);

    public IContactRepository Contacts => 
        _contactRepository ??= new ContactRepository(_context);

    public IOpportunityRepository Opportunities => 
        _opportunityRepository ??= new OpportunityRepository(_context);

    public IContractRepository Contracts => 
        _contractRepository ??= new ContractRepository(_context);


    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
} 