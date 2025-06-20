using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;
using CustomerManagementSystem.Server.Interfaces;
using CustomerManagementSystem.Server.Models;

namespace CustomerManagementSystem.Server.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly string _connectionString;

        public CustomerRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string not found");
        }

        public async Task<CustomerListResponse> GetAllCustomersAsync(int pageNumber = 1, int pageSize = 10, string searchTerm = "")
        {
            using var connection = new SqlConnection(_connectionString);

            var parameters = new DynamicParameters();
            parameters.Add("@PageNumber", pageNumber);
            parameters.Add("@PageSize", pageSize);
            parameters.Add("@SearchTerm", searchTerm ?? "");

            using var multi = await connection.QueryMultipleAsync(
                "sp_GetAllCustomers",
                parameters,
                commandType: CommandType.StoredProcedure);

            var customers = (await multi.ReadAsync<Customer>()).ToList();
            var totalCount = await multi.ReadSingleAsync<int>();

            return new CustomerListResponse
            {
                Customers = customers,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<Customer?> GetCustomerByIdAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);

            var parameters = new DynamicParameters();
            parameters.Add("@Id", id);

            var customer = await connection.QuerySingleOrDefaultAsync<Customer>(
                "sp_GetCustomerById",
                parameters,
                commandType: CommandType.StoredProcedure);

            return customer;
        }

        public async Task<int> CreateCustomerAsync(CustomerCreateRequest request)
        {
            using var connection = new SqlConnection(_connectionString);

            var parameters = new DynamicParameters();
            parameters.Add("@Name", request.Name);
            parameters.Add("@Email", request.Email);
            parameters.Add("@Phone", request.Phone);
            parameters.Add("@Address", request.Address);

            var newId = await connection.QuerySingleAsync<int>(
                "sp_InsertCustomer",
                parameters,
                commandType: CommandType.StoredProcedure);

            return newId;
        }

        public async Task<bool> UpdateCustomerAsync(CustomerUpdateRequest request)
        {
            using var connection = new SqlConnection(_connectionString);

            var parameters = new DynamicParameters();
            parameters.Add("@Id", request.Id);
            parameters.Add("@Name", request.Name);
            parameters.Add("@Email", request.Email);
            parameters.Add("@Phone", request.Phone);
            parameters.Add("@Address", request.Address);

            var rowsAffected = await connection.ExecuteAsync(
                "sp_UpdateCustomer",
                parameters,
                commandType: CommandType.StoredProcedure);

            return rowsAffected > 0;
        }

        public async Task<bool> DeleteCustomerAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);

            var parameters = new DynamicParameters();
            parameters.Add("@Id", id);

            var rowsAffected = await connection.ExecuteAsync(
                "sp_DeleteCustomer",
                parameters,
                commandType: CommandType.StoredProcedure);

            return rowsAffected > 0;
        }
    }
}