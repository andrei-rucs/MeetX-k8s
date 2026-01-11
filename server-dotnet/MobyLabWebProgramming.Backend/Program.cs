using MobyLabWebProgramming.Infrastructure.Extensions;
using SignalRChat.Hubs;
using Prometheus;

var builder = WebApplication.CreateBuilder(args);

builder.AddCorsConfiguration()
    .AddRepository()
    .AddAuthorizationWithSwagger("MobyLab Web App")
    .AddServices()
    .UseLogger()
    .AddWorkers()
    .AddApi();

var app = builder.Build();

/*app.UseMiddleware<Test>();*/

app.UseHttpMetrics();
app.ConfigureApplication();
app.MapHub<ChatService>("/chatHub");
app.MapMetrics();
app.Run();