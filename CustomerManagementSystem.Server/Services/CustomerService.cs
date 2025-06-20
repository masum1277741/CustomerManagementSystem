using CustomerManagementSystem.Server.Interfaces;
using CustomerManagementSystem.Server.Models;

namespace CustomerManagementSystem.Server.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly ILogger<CustomerService> _logger;

        public CustomerService(ICustomerRepository customerRepository, ILogger<CustomerService> logger)
        {
            _customerRepository = customerRepository;
            _logger = logger;
        }

        public async Task<CustomerListResponse> GetAllCustomersAsync(int pageNumber = 1, int pageSize = 10, string searchTerm = "")
        {
            try
            {
                _logger.LogInformation("Getting customers - Page: {PageNumber}, Size: {PageSize}, Search: {SearchTerm}",
                    pageNumber, pageSize, searchTerm);

                return await _customerRepository.GetAllCustomersAsync(pageNumber, pageSize, searchTerm);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customers");
                throw;
            }
        }

        public async Task<Customer?> GetCustomerByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting customer by ID: {Id}", id);
                return await _customerRepository.GetCustomerByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer by ID: {Id}", id);
                throw;
            }
        }

        public async Task<int> CreateCustomerAsync(CustomerCreateRequest request)
        {
            try
            {
                _logger.LogInformation("Creating customer: {Email}", request.Email);

                // Check if email is unique
                if (!await IsEmailUniqueAsync(request.Email))
                {
                    throw new ArgumentException("Email already exists");
                }

                return await _customerRepository.CreateCustomerAsync(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating customer: {Email}", request.Email);
                throw;
            }
        }

        public async Task<bool> UpdateCustomerAsync(CustomerUpdateRequest request)
        {
            try
            {
                _logger.LogInformation("Updating customer: {Id}", request.Id);

                if (!await IsEmailUniqueAsync(request.Email, request.Id))
                {
                    throw new ArgumentException("Email already exists");
                }

                return await _customerRepository.UpdateCustomerAsync(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating customer: {Id}", request.Id);
                throw;
            }
        }

        public async Task<bool> DeleteCustomerAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting customer: {Id}", id);
                return await _customerRepository.DeleteCustomerAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting customer: {Id}", id);
                throw;
            }
        }

        public async Task<bool> IsEmailUniqueAsync(string email, int? excludeId = null)
        {
            try
            {
                var customers = await _customerRepository.GetAllCustomersAsync(1, 1000, "");
                return !customers.Customers.Any(c =>
                    c.Email.Equals(email, StringComparison.OrdinalIgnoreCase) &&
                    c.Id != excludeId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking email uniqueness: {Email}", email);
                throw;
            }
        }
    }
}