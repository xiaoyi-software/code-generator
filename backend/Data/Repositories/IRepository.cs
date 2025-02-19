using System.Linq.Expressions;

namespace CodeGenerator.Data.Repositories;

public interface IRepository<T> where T : class
{
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> GetByIdAsync(int id);
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(int id);
    
    IQueryable<T> Find(Expression<Func<T, bool>> predicate);
}