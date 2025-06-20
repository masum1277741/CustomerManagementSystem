using CustomerManagementSystem.Server.Models;

namespace CustomerManagementSystem.Server.Interfaces
{
    public interface ICustomerService
    {
        Task<CustomerListResponse> GetAllCustomersAsync(int pageNumber = 1, int pageSize = 10, string searchTerm = "");
        Task<Customer?> GetCustomerByIdAsync(int id);
        Task<int> CreateCustomerAsync(CustomerCreateRequest customer);
        Task<bool> UpdateCustomerAsync(CustomerUpdateRequest customer);
        Task<bool> DeleteCustomerAsync(int id);
        Task<bool> IsEmailUniqueAsync(string email, int? excludeId = null);
    }
}