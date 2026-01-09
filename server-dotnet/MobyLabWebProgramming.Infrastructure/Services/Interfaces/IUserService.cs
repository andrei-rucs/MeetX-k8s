using Microsoft.AspNetCore.Http;
using MobyLabWebProgramming.Core.DataTransferObjects;
using MobyLabWebProgramming.Core.Entities;
using MobyLabWebProgramming.Core.Requests;
using MobyLabWebProgramming.Core.Responses;

namespace MobyLabWebProgramming.Infrastructure.Services.Interfaces;

public interface IUserService
{

    public Task<ServiceResponse<UserDTO>> GetUser(Guid id, CancellationToken cancellationToken = default);
    public Task<ServiceResponse<User>> GetUserNotDTO(Guid id, CancellationToken cancellationToken = default);

    public Task<ServiceResponse<PagedResponse<UserDTO>>> GetUsers(PaginationSearchQueryParams pagination, UserDTO? requestingUser, CancellationToken cancellationToken = default);

    // public Task<ServiceResponse<LoginResponseDTO>> Login(LoginDTO login, CancellationToken cancellationToken = default);
    public Task<ServiceResponse> Logout(HttpContext context, UserDTO? requestingUser = default, CancellationToken cancellationToken = default);
    public Task<ServiceResponse> MakeStaff(Guid userId, UserDTO? requestingUser = default, CancellationToken cancellationToken = default);
    public Task<ServiceResponse> RemoveStaff(Guid userId, UserDTO? requestingUser = default, CancellationToken cancellationToken = default);

    public Task<ServiceResponse<int>> GetUserCount(CancellationToken cancellationToken = default);

    public Task<ServiceResponse> UpdateUser(UserUpdateDTO user, User? requestingUser = default, CancellationToken cancellationToken = default);

    // public Task<ServiceResponse> Register(RegisterDTO register, CancellationToken cancellationToken = default);

    // public Task<ServiceResponse> RequestReset(RequestResetDTO requestReset, CancellationToken cancellationToken = default);

    // public Task<ServiceResponse> ResetPassword(ResetPasswordDTO reset, CancellationToken cancellationToken = default);

    // public Task<ServiceResponse<RefreshResponseDTO>> RefreshToken(CancellationToken cancellationToken = default);
}
