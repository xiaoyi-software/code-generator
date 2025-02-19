using CodeGenerator.Data.Repositories.Interfaces;

namespace CodeGenerator.Data.Repositories;

public interface IUnitOfWork : IDisposable
{
    ICustomerRepository Customers { get; }
    IContactRepository Contacts { get; }
    IOpportunityRepository Opportunities { get; }
    IContractRepository Contracts { get; }


    Task<int> SaveChangesAsync();
} 