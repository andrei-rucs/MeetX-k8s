using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Text;
using System.Web;
using Ardalis.Specification;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MobyLabWebProgramming.Core.DataTransferObjects;
using MobyLabWebProgramming.Core.Entities;
using MobyLabWebProgramming.Core.Enums;
using MobyLabWebProgramming.Core.Errors;
using MobyLabWebProgramming.Core.Requests;
using MobyLabWebProgramming.Core.Responses;
using MobyLabWebProgramming.Core.Specifications;
using MobyLabWebProgramming.Infrastructure.Authorization;
using MobyLabWebProgramming.Infrastructure.Configurations;
using MobyLabWebProgramming.Infrastructure.Database;
using MobyLabWebProgramming.Infrastructure.Repositories.Interfaces;
using MobyLabWebProgramming.Infrastructure.Services.Interfaces;
namespace MobyLabWebProgramming.Infrastructure.Services.Implementations;

public class UserService : IUserService
{
    private readonly IRepository<WebAppDatabaseContext> _repository; private readonly IMailService _mailService;
    private readonly IValidationService _validationService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly RefreshJwtConfiguration _jwtConfiguration;
    private readonly IFileService _fileService;

    public UserService(IRepository<WebAppDatabaseContext> repository, IMailService mailService, IValidationService validationService, IHttpContextAccessor httpContextAccessor, IOptions<RefreshJwtConfiguration> jwtConfiguration, IFileService fileService)
    {
        _repository = repository;
        _mailService = mailService;
        _validationService = validationService;
        _httpContextAccessor = httpContextAccessor;
        _jwtConfiguration = jwtConfiguration.Value;
        _fileService = fileService;
    }

    public async Task<ServiceResponse<UserDTO>> GetUser(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _repository.GetAsync(new UserProjectionSpec(id), cancellationToken);

        return result != null ?
            ServiceResponse<UserDTO>.ForSuccess(result) :
            ServiceResponse<UserDTO>.FromError(CommonErrors.UserNotFound);
    }

    public async Task<ServiceResponse<User>> GetUserNotDTO(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _repository.GetAsync(new UserSpec(id), cancellationToken);

        return result != null ?
            ServiceResponse<User>.ForSuccess(result) :
            ServiceResponse<User>.FromError(CommonErrors.UserNotFound);
    }

    public async Task<ServiceResponse<PagedResponse<UserDTO>>> GetUsers(PaginationSearchQueryParams pagination, UserDTO? requestingUser, CancellationToken cancellationToken = default)
    {
        if (requestingUser == null)
        {
            return ServiceResponse<PagedResponse<UserDTO>>.FromError(CommonErrors.UserNotFound);
        }

        if (requestingUser.Role != UserRoleEnum.Admin)
        {
            return ServiceResponse<PagedResponse<UserDTO>>.FromError(CommonErrors.NotAnAppAdmin);
        }

        var result = await _repository.PageAsync(pagination, new UserProjectionSpec(pagination.Search), cancellationToken);

        return ServiceResponse<PagedResponse<UserDTO>>.ForSuccess(result);
    }

    // public async Task<ServiceResponse<LoginResponseDTO>> Login(LoginDTO login, CancellationToken cancellationToken = default)
    // {
    //     var result = await _repository.GetAsync(new UserSpec(login.Email), cancellationToken);

    //     if (result == null)
    //     {
    //         return ServiceResponse<LoginResponseDTO>.FromError(CommonErrors.BadCredentials);
    //     }

    //     if (result.Password != login.Password)
    //     {
    //         return ServiceResponse<LoginResponseDTO>.FromError(CommonErrors.BadCredentials);
    //     }

    //     var user = new UserDTO
    //     {
    //         Id = result.Id,
    //         Email = result.Email,
    //         Name = result.Name,
    //         Role = result.Role,
    //         RegisteredDate = DateTime.Parse(result.CreatedAt.ToUniversalTime().ToString(), null, DateTimeStyles.RoundtripKind).ToString(),
    //         ShortName = result.ShortName,
    //         Color = result.Color,
    //         AvatarPath = result.AvatarPath,
    //         Status = result.Status,
    //         Position = result.Position,
    //     };

    //     var entity = await _repository.GetAsync(new RefreshTokenSpec(user.Id), cancellationToken);

    //     if (entity != null)
    //     {
    //         entity.Token = _loginService.GetToken(user, DateTime.UtcNow, new(7, 0, 0, 0), TokenTypeEnum.Refresh);
    //         await _repository.UpdateAsync(entity, cancellationToken);
    //     } else
    //     {
    //         entity = await _repository.AddAsync(new RefreshToken
    //         {
    //             Token = _loginService.GetToken(user, DateTime.UtcNow, new(7, 0, 0, 0), TokenTypeEnum.Refresh),
    //             UserId = user.Id,
    //         }, cancellationToken);
    //     }

    //     if (_httpContextAccessor.HttpContext != null)
    //     {
    //         _httpContextAccessor.HttpContext.Response.Cookies.Append("MeetxRefresh", entity.Token,
    //         new CookieOptions
    //         {
    //             Expires = DateTime.UtcNow.AddDays(7),
    //             HttpOnly = true,
    //             Secure = true,
    //             IsEssential = true,
    //             SameSite = SameSiteMode.Lax
    //         });
    //     } else
    //     {
    //         Console.WriteLine("nu e ok");
    //     }

    //     return ServiceResponse<LoginResponseDTO>.ForSuccess(new()
    //     {
    //         User = user,
    //         Token = _loginService.GetToken(user, DateTime.UtcNow, new(0, 1, 0, 0), TokenTypeEnum.Auth)
    //     });
    // }

    public async Task<ServiceResponse<int>> GetUserCount(CancellationToken cancellationToken = default) =>
        ServiceResponse<int>.ForSuccess(await _repository.GetCountAsync<User>(cancellationToken));

    public async Task<ServiceResponse> UpdateUser(UserUpdateDTO user, User? requestingUser, CancellationToken cancellationToken = default)
    {
        bool positionChanged = false;
        if (requestingUser == null)
        {
            return ServiceResponse.FromError(CommonErrors.UserNotFound);
        }

        if (user == null)
        {
            return ServiceResponse.FromError(CommonErrors.BadRequets);
        }

        if (user.Name != null)
        {
            var name = user.Name.Trim();

            if (name.Length < 2 || name.Length > 4095)
            {
                return ServiceResponse.FromError(CommonErrors.BadName);
            }
            requestingUser.Name = name;
            requestingUser.ShortName = name.Split(' ').Length > 1 ? $"{name.Split(' ')[0][0]}{name.Split(' ')[1][0]}" : name.Substring(0, 2);
        }

        if (user.Position != null)
        {
            var position = user.Position.Trim();
            if (position.Length < 1 || position.Length > 255)
            {
                return ServiceResponse.FromError(CommonErrors.BadPosition);
            }
            if (position != requestingUser.Position)
            {
                requestingUser.Position = position;
                positionChanged = true;
            }
        }

        if (user.Password != null && user.Password != "")
        {
            if (_validationService.VerifyPassword(user.Password) || user.Password.Length > 4095)
            {
                return ServiceResponse.FromError(CommonErrors.BadPassword);
            }
            requestingUser.Password = PasswordUtils.HashPassword(user.Password);
        }

        if (user.Avatar != null)
        {
            Console.WriteLine("ok");
            var path = _fileService.SaveAvatar(user.Avatar, requestingUser.Id);
            if (path != null)
            {
                if (path.Result != null)
                {
                    requestingUser.AvatarPath = path.Result;
                }
                else if (path.Error != null)
                {
                    return ServiceResponse.FromError(path.Error);
                }
            }
            else
            {
                return ServiceResponse.FromError(CommonErrors.FileAddError);
            }
        }

        if (user.AvatarRemoved)
        {
            requestingUser.AvatarPath = "";
        }

        await _repository.UpdateAsync(requestingUser, cancellationToken);

        if (positionChanged)
        {
            var res = await JobSimilarityService.RecommendJobs(requestingUser.Position);

            if (res != null && res != "")
            {
                Console.WriteLine(res);
                var groupPos = await _repository.GetAsync(new GroupSpec(true, res), cancellationToken);
                if (groupPos != null)
                {
                    groupPos.Users.Add(requestingUser);
                    await _repository.UpdateAsync(groupPos, cancellationToken);
                }
            }
        }

        return ServiceResponse.ForSuccess();
    }

    // public async Task<ServiceResponse> Register(RegisterDTO register, CancellationToken cancellationToken = default)
    // {
    //     if (register == null || register.Email.IsNullOrEmpty() || register.Name.IsNullOrEmpty() || register.Password.IsNullOrEmpty() || register.Position.IsNullOrEmpty())
    //     {
    //         return ServiceResponse.FromError(CommonErrors.BadRequets);
    //     }

    //     var name = register.Name.Trim();
    //     var position = register.Position.Trim();

    //     if (name.Length < 2 || name.Length > 255)
    //     {
    //         return ServiceResponse.FromError(CommonErrors.BadName);
    //     }

    //     if (position.Length < 1 || position.Length > 255)
    //     {
    //         return ServiceResponse.FromError(CommonErrors.BadPosition);
    //     }

    //     if (!_validationService.VerifyEmail(register.Email) || register.Email.Length > 255)
    //     {
    //         return ServiceResponse.FromError(CommonErrors.BadEmail);
    //     }

    //     if (_validationService.VerifyPassword(register.Password) || register.Password.Length > 255)
    //     {
    //         return ServiceResponse.FromError(CommonErrors.BadPassword);
    //     }

    //     if (register.GroupId == Guid.Empty)
    //     {
    //         return ServiceResponse.FromError(CommonErrors.BadIndustry);
    //     }

    //     var result = await _repository.GetAsync(new UserSpec(register.Email), cancellationToken);

    //     if (result != null)
    //     {
    //         return ServiceResponse.FromError(CommonErrors.UserAlreadyExists);
    //     }

    //     var group = await _repository.GetAsync(new GroupSpec(register.GroupId), cancellationToken);

    //     if (group == null)
    //     {
    //         return ServiceResponse.FromError(CommonErrors.GroupNotFound);
    //     }

    //     List<string> colors = new List<string> { "#e03f4f", "#c16ca8", "#a86cc1", "#6ca8c1", "#98fb98", "#3fe0d0", "#26abff" };
    //     Random random = new Random();
    //     int randomIndex = random.Next(0, colors.Count);

    //     var user = await _repository.AddAsync(new User
    //     {
    //         Email = register.Email,
    //         Name = name,
    //         Position = position,
    //         Role = UserRoleEnum.Client,
    //         Password = PasswordUtils.HashPassword(register.Password),
    //         ShortName = name.Split(' ').Length > 1 ? $"{name.Split(' ')[0][0]}{name.Split(' ')[1][0]}" : name.Substring(0, 2),
    //         Color = colors[randomIndex]
    //     }, cancellationToken);

    //     while (group != null)
    //     {
    //         group.Users.Add(user);
    //         group = await _repository.UpdateAsync(group, cancellationToken);
    //         Guid parentGroupId = group.ParentGroupId ?? Guid.Empty;
    //         group = await _repository.GetAsync(new GroupSpec(parentGroupId), cancellationToken);
    //     }

    //     var res = await JobSimilarityService.RecommendJobs(position);

    //     if (res != null && res != "")
    //     {
    //         Console.WriteLine(res);
    //         var groupPos = await _repository.GetAsync(new GroupSpec(true, res), cancellationToken);
    //         if (groupPos != null)
    //         {
    //             groupPos.Users.Add(user);
    //             await _repository.UpdateAsync(groupPos, cancellationToken);
    //         }
    //     }

    //     _mailService.SendMail(register.Email, "Welcome!", MobyLabWebProgramming.Core.Constants.MailTemplates.Register(register.Name), true, "MeetX", cancellationToken);

    //     return ServiceResponse.ForSuccess();
    // }

    public async Task<ServiceResponse> Logout(HttpContext context, UserDTO? requestingUser = default, CancellationToken cancellationToken = default)
    {
        if (requestingUser == null)
        {
            return ServiceResponse.FromError(CommonErrors.UserNotFound);
        }

        await _repository.DeleteAsync(new RefreshTokenSpec(requestingUser.Id), cancellationToken);

        if (context.Request.Cookies.ContainsKey("MeetxRefresh"))
        {
            context.Response.Cookies.Append("MeetxRefresh", "", new CookieOptions
            {
                Expires = DateTimeOffset.UtcNow.AddDays(-10),
                Path = "/"
            });
        }

        return ServiceResponse.ForSuccess();
    }

    // public async Task<ServiceResponse> RequestReset(RequestResetDTO requestReset, CancellationToken cancellationToken = default)
    // {
    //     if (!_validationService.VerifyEmail(requestReset.Email))
    //     {
    //         return ServiceResponse.FromError(CommonErrors.BadEmail);
    //     }

    //     var entity = await _repository.GetAsync(new UserSpec(requestReset.Email), cancellationToken);

    //     if (entity == null)
    //     {
    //         return ServiceResponse.ForSuccess();
    //     }

    //     var token = await _repository.GetAsync(new ResetTokenSpec(entity.Id, SpecEnum.ByUserId), cancellationToken);

    //     var resetToken = _loginService.GetRandomToken();

    //     if (token == null)
    //     {
    //         token = await _repository.AddAsync(new ResetToken
    //         {
    //             Token = resetToken,
    //             UserId = entity.Id,
    //         }, cancellationToken);
    //     } else
    //     {
    //         token.Token = resetToken ?? token.Token;

    //         await _repository.UpdateAsync(token, cancellationToken);
    //     }
    //     var link = $"http://localhost:5173/resetPassword?token={HttpUtility.UrlEncode(token.Token)}&id={token.Id}";
    //     _mailService.SendMail(requestReset.Email, "Password Reset Request", MobyLabWebProgramming.Core.Constants.MailTemplates.PasswordResetTemplate(entity.Name, link), true, "MeetX", cancellationToken);

    //     return ServiceResponse.ForSuccess();
    // }

    public async Task<ServiceResponse> MakeStaff(Guid userId, UserDTO? requestingUser = default, CancellationToken cancellationToken = default)
    {
        if (requestingUser == null)
        {
            return ServiceResponse.FromError(CommonErrors.UserNotFound);
        }

        if (requestingUser.Role != UserRoleEnum.Admin)
        {
            return ServiceResponse.FromError(CommonErrors.NotAnAppAdmin);
        }

        if (requestingUser.Id == userId)
        {
            return ServiceResponse.FromError(CommonErrors.ChangeMyRole);
        }

        var user = await _repository.GetAsync(new UserSpec(userId), cancellationToken);

        if (user == null)
        {
            return ServiceResponse.FromError(CommonErrors.UserNotFound);
        }

        user.Role = UserRoleEnum.Staff;
        user = await _repository.UpdateAsync(user, cancellationToken);

        var groups = await _repository.ListAsync(new GroupSpec(true), cancellationToken);

        foreach (var group in groups)
        {
            group.Admins.Add(user);
            await _repository.UpdateAsync(group, cancellationToken);
        }

        return ServiceResponse.ForSuccess();
    }
    public async Task<ServiceResponse> RemoveStaff(Guid userId, UserDTO? requestingUser = default, CancellationToken cancellationToken = default)
    {
        if (requestingUser == null)
        {
            return ServiceResponse.FromError(CommonErrors.UserNotFound);
        }

        if (requestingUser.Role != UserRoleEnum.Admin)
        {
            return ServiceResponse.FromError(CommonErrors.NotAnAppAdmin);
        }

        if (requestingUser.Id == userId)
        {
            return ServiceResponse.FromError(CommonErrors.ChangeMyRole);
        }

        var user = await _repository.GetAsync(new UserSpec(userId), cancellationToken);

        if (user == null)
        {
            return ServiceResponse.FromError(CommonErrors.UserNotFound);
        }

        user.Role = UserRoleEnum.Client;
        user = await _repository.UpdateAsync(user, cancellationToken);

        var groups = await _repository.ListAsync(new GroupSpec(true), cancellationToken);

        foreach (var group in groups)
        {
            group.Admins.Remove(user);
            await _repository.UpdateAsync(group, cancellationToken);
        }

        return ServiceResponse.ForSuccess();
    }

    // public async Task<ServiceResponse> ResetPassword(ResetPasswordDTO reset, CancellationToken cancellationToken = default)
    // {
    //     Console.WriteLine(reset.Token);
    //     var token = await _repository.GetAsync(new ResetTokenSpec(reset.Id, SpecEnum.ByTokenId), cancellationToken);

    //     if (token == null || token.Token != reset.Token)
    //     {
    //         return ServiceResponse.FromError(CommonErrors.ResetTokenExpired);
    //     }

    //     var user = await _repository.GetAsync(new UserSpec(token.UserId), cancellationToken);

    //     if (user == null)
    //     {
    //         await _repository.DeleteAsync(new ResetTokenSpec(reset.Id, SpecEnum.ByTokenId), cancellationToken);
    //         return ServiceResponse.FromError(CommonErrors.ResetTokenExpired);
    //     }

    //     if (token.UpdatedAt.AddMinutes(30) < DateTime.UtcNow)
    //     {
    //         await _repository.DeleteAsync(new ResetTokenSpec(reset.Id, SpecEnum.ByTokenId), cancellationToken);
    //         return ServiceResponse.FromError(CommonErrors.ResetTokenExpired);
    //     }

    //     if (_validationService.VerifyPassword(reset.Password) || reset.Password.Length > 255)
    //     {
    //         return ServiceResponse.FromError(CommonErrors.BadPassword);
    //     }

    //     await _repository.DeleteAsync(new ResetTokenSpec(reset.Id, SpecEnum.ByTokenId), cancellationToken);
    //     user.Password = PasswordUtils.HashPassword(reset.Password) ?? user.Password;
    //     await _repository.UpdateAsync(user, cancellationToken);

    //     _mailService.SendMail(user.Email, "Password Changed Successfully", MobyLabWebProgramming.Core.Constants.MailTemplates.PasswordChangeSuccessTemplate(user.Name), true, "MeetX", cancellationToken);

    //     return ServiceResponse.ForSuccess();
    // }

    // public async Task<ServiceResponse<RefreshResponseDTO>> RefreshToken(CancellationToken cancellationToken = default)
    // {

    //     if (_httpContextAccessor.HttpContext != null)
    //     {
    //         var token = _httpContextAccessor.HttpContext.Request.Cookies["MeetxRefresh"];

    //         if (token != null)
    //         {
    //             var entity = await _repository.GetAsync(new RefreshTokenSpec(token), cancellationToken);

    //             if (entity != null)
    //             {
    //                 var tokenHandler = new JwtSecurityTokenHandler();
    //                 var key = Encoding.ASCII.GetBytes(_jwtConfiguration.Key);
    //                 try
    //                 {
    //                     tokenHandler.ValidateToken(token, new TokenValidationParameters
    //                     {
    //                         ValidateIssuerSigningKey = true,
    //                         IssuerSigningKey = new SymmetricSecurityKey(key),
    //                         ValidateIssuer = true,
    //                         ValidateAudience = true,
    //                         ValidAudience = _jwtConfiguration.Audience,
    //                         ValidIssuer = _jwtConfiguration.Issuer,
    //                         ClockSkew = TimeSpan.Zero
    //                     }, out SecurityToken validatedToken);

    //                     var jwtToken = (JwtSecurityToken)validatedToken;
    //                     var userId = Guid.Parse(jwtToken.Claims.First(x => x.Type == "nameid").Value);

    //                     var user = await _repository.GetAsync(new UserSpec(userId), cancellationToken);

    //                     if (user != null)
    //                     {
    //                         var userDTO = new UserDTO
    //                         {
    //                             Id = user.Id,
    //                             Email = user.Email,
    //                             Name = user.Name,
    //                             Role = user.Role,
    //                             RegisteredDate = DateTime.Parse(user.CreatedAt.ToUniversalTime().ToString(), null, DateTimeStyles.RoundtripKind).ToString(),
    //                             ShortName = user.ShortName,
    //                             Color = user.Color,
    //                             Status = user.Status,
    //                             AvatarPath = user.AvatarPath,
    //                             Position = user.Position,
    //                         };

    //                         entity.Token = _loginService.GetToken(userDTO, DateTime.UtcNow, new(7, 0, 0, 0), TokenTypeEnum.Refresh);
    //                         await _repository.UpdateAsync(entity, cancellationToken);

    //                         if (_httpContextAccessor.HttpContext != null)
    //                         {
    //                             _httpContextAccessor.HttpContext.Response.Cookies.Append("MeetxRefresh", entity.Token,
    //                             new CookieOptions
    //                             {
    //                                 Expires = DateTime.UtcNow.AddDays(7),
    //                                 HttpOnly = true,
    //                                 Secure = true,
    //                                 IsEssential = true,
    //                                 SameSite = SameSiteMode.None
    //                             });
    //                         }

    //                         return ServiceResponse<RefreshResponseDTO>.ForSuccess(new()
    //                         {
    //                             Token = _loginService.GetToken(userDTO, DateTime.UtcNow, new(0, 1, 0, 0), TokenTypeEnum.Auth)
    //                         });
    //                     }
    //                 }
    //                 catch
    //                 {
    //                     return ServiceResponse<RefreshResponseDTO>.FromError(CommonErrors.RefreshTokenExpired);
    //                 }
    //             }
    //         }
    //     }
    //     return ServiceResponse<RefreshResponseDTO>.FromError(CommonErrors.RefreshTokenExpired);
    // }
}
