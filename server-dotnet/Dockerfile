FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY MobyLabWebProgramming.sln ./

COPY MobyLabWebProgramming.Backend/MobyLabWebProgramming.Backend.csproj MobyLabWebProgramming.Backend/
COPY MobyLabWebProgramming.Core/MobyLabWebProgramming.Core.csproj MobyLabWebProgramming.Core/
COPY MobyLabWebProgramming.Infrastructure/MobyLabWebProgramming.Infrastructure.csproj MobyLabWebProgramming.Infrastructure/

RUN dotnet restore

COPY . .

WORKDIR /src/MobyLabWebProgramming.Backend
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

COPY --from=publish /app/publish .

COPY MobyLabWebProgramming.Backend/job_titles_with_embeddings.csv ./
COPY MobyLabWebProgramming.Infrastructure/Workers/public-groups.xlsx ./
COPY MobyLabWebProgramming.Infrastructure/Workers/jobs.xlsx ./

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "MobyLabWebProgramming.Backend.dll"]
