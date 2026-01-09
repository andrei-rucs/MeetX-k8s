using Microsoft.AspNetCore.Mvc;
using System.Net;
using RestSharp;
using Newtonsoft.Json.Linq;
using MobyLabWebProgramming.Infrastructure.Configurations;
using MobyLabWebProgramming.Infrastructure.Database;
using MobyLabWebProgramming.Infrastructure.Repositories.Interfaces;
using MobyLabWebProgramming.Infrastructure.Services.Interfaces;
using MobyLabWebProgramming.Core.Enums;
using MobyLabWebProgramming.Core.Entities;
using MobyLabWebProgramming.Core.Specifications;

namespace MobyLabWebProgramming.Controllers
{
    public class LinkedInController : Controller
    {
        // private readonly IConfiguration _configuration;
        // private readonly IRepository<WebAppDatabaseContext> _repository;
        // private readonly ILoginService _loginService;

        // public LinkedInController(IConfiguration configuration, IRepository<WebAppDatabaseContext> repository, ILoginService loginService)
        // {
        //     _configuration = configuration;
        //     _repository = repository;
        //     _loginService = loginService;
        // }

        // [HttpGet("signin-linkedin-link")]
        // public ActionResult LoginLink()
        // {
        //     var linkedInConfiguration = _configuration.GetSection(nameof(LinkedInConfiguration)).Get<LinkedInConfiguration>();
        //     if (linkedInConfiguration == null)
        //     {
        //         return Redirect("http://localhost:5173/error?type=login");
        //     }
        //     return Redirect($"https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={linkedInConfiguration.ClientId}&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fsignin-linkedin&state=987654321&scope=profile,email,w_member_social,openid");
        // }

        // [HttpGet("signup-linkedin-link")]
        // public ActionResult RegisterLink()
        // {
        //     var linkedInConfiguration = _configuration.GetSection(nameof(LinkedInConfiguration)).Get<LinkedInConfiguration>();
        //     if (linkedInConfiguration == null)
        //     {
        //         return Redirect("http://localhost:5173/error?type=register");
        //     }
        //     return Redirect($"https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={linkedInConfiguration.ClientId}&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fsignup-linkedin&state=987654321&scope=profile,email,w_member_social,openid");
        // }

        // [HttpGet("signin-linkedin")]
        // public async Task Login()
        // {
        //     try
        //     {
        //         var code = Request.Query["code"];
        //         var state = Request.Query["state"];
        //         var client = new RestClient("https://www.linkedin.com");
        //         var request = new RestRequest("oauth/v2/accessToken", Method.Post);
        //         ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072;
        //         request.AddParameter("grant_type", "authorization_code");
        //         request.AddParameter("code", code.ToString());
        //         request.AddParameter("redirect_uri", "http://localhost:5000/signin-linkedin");
        //         request.AddParameter("client_id", "777xvafbt8y9ov");
        //         request.AddParameter("client_secret", "WPL_AP0.3ZNk9g5B3DdgVe9f.MjkwMjYwNzAxNg==");
        //         var response = client.Execute(request);
        //         var content = response.Content;
        //         var res = JObject.Parse(content);
        //         var accessToken = res["access_token"].ToString();

        //         var client2 = new RestClient("https://api.linkedin.com");
        //         var request2 = new RestRequest("v2/userinfo", Method.Get);
        //         request2.AddHeader("Authorization", $"Bearer {accessToken}");

        //         var response2 = client2.Execute(request2);

        //         var content2 = response2.Content;
        //         var userData = JObject.Parse(content2);
        //         var userEmail = userData["email"].ToString();
        //         var userName = userData["name"].ToString();

        //         var user = await _repository.GetAsync(new MobyLabWebProgramming.Core.Specifications.UserSpec(userEmail));

        //         if (user == null)
        //         {
        //             HttpContext.Response.Redirect($"http://localhost:5173/register?name={userName}&email={userEmail}");
        //             return;
        //         }

        //         var token = _loginService.GetToken(new Core.DataTransferObjects.UserDTO()
        //         {
        //             Id = user.Id,
        //             Name = user.Name,
        //             Email = user.Email,
        //             Role = user.Role,
        //         }, DateTime.UtcNow, new(0, 1, 0, 0), TokenTypeEnum.Auth);

        //         var entity = await _repository.GetAsync(new RefreshTokenSpec(user.Id));

        //         if (entity != null)
        //         {
        //             entity.Token = _loginService.GetToken(new Core.DataTransferObjects.UserDTO()
        //             {
        //                 Id = user.Id,
        //                 Name = user.Name,
        //                 Email = user.Email,
        //                 Role = user.Role,
        //             }, DateTime.UtcNow, new(7, 0, 0, 0), TokenTypeEnum.Refresh);
        //             await _repository.UpdateAsync(entity);
        //         }
        //         else
        //         {
        //             entity = await _repository.AddAsync(new RefreshToken
        //             {
        //                 Token = _loginService.GetToken(new Core.DataTransferObjects.UserDTO()
        //                 {
        //                     Id = user.Id,
        //                     Name = user.Name,
        //                     Email = user.Email,
        //                     Role = user.Role,
        //                 }, DateTime.UtcNow, new(7, 0, 0, 0), TokenTypeEnum.Refresh),
        //                 UserId = user.Id,
        //             });
        //         }

        //         HttpContext.Response.Cookies.Append("MeetxRefresh", entity.Token,
        //         new CookieOptions
        //         {
        //             Expires = DateTime.UtcNow.AddDays(7),
        //             HttpOnly = true,
        //             Secure = true,
        //             IsEssential = true,
        //             SameSite = SameSiteMode.Lax
        //         });
        //         HttpContext.Response.Redirect($"http://localhost:5173/redirectLogin?token={token}");
        //         return;
        //     }
        //     catch (Exception ex)
        //     {
        //         Console.WriteLine(ex.Message);
        //         HttpContext.Response.Redirect("http://localhost:5173/error?type=login");
        //         return;
        //     }
        // }

        // [HttpGet("signup-linkedin")]
        // public ActionResult Register()
        // {
        //     try
        //     {
        //         var code = Request.Query["code"];
        //         var state = Request.Query["state"];
        //         var client = new RestClient("https://www.linkedin.com");
        //         var request = new RestRequest("oauth/v2/accessToken", Method.Post);
        //         ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072;
        //         request.AddParameter("grant_type", "authorization_code");
        //         request.AddParameter("code", code.ToString());
        //         request.AddParameter("redirect_uri", "http://localhost:5000/signup-linkedin");
        //         request.AddParameter("client_id", "777xvafbt8y9ov");
        //         request.AddParameter("client_secret", "WPL_AP0.3ZNk9g5B3DdgVe9f.MjkwMjYwNzAxNg==");
        //         var response = client.Execute(request);
        //         var content = response.Content;
        //         var res = JObject.Parse(content);
        //         var accessToken = res["access_token"].ToString();

        //         var client2 = new RestClient("https://api.linkedin.com");
        //         var request2 = new RestRequest("v2/userinfo", Method.Get);
        //         request2.AddHeader("Authorization", $"Bearer {accessToken}");

        //         var response2 = client2.Execute(request2);

        //         var content2 = response2.Content;
        //         var user = JObject.Parse(content2);
        //         var userEmail = user["email"].ToString();
        //         var userName = user["name"].ToString();
        //         return Redirect($"http://localhost:5173/register?name={userName}&email={userEmail}");
        //     }
        //     catch (Exception ex)
        //     {
        //         Console.WriteLine(ex.Message);
        //         return Redirect("http://localhost:5173/error?type=register");
        //     }
        // }
    }
}