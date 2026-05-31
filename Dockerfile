FROM mcr.microsoft.com/dotnet/aspnet:10.0.6 AS base
WORKDIR /app
EXPOSE 8080


FROM mcr.microsoft.com/dotnet/sdk:10.0.301 AS build
WORKDIR /src


FROM mcr.microsoft.com/dotnet/sdk:10.0.301 AS build

# Katmanların bağımlılıklarını optimize etmek için csproj dosyalarını kopyalıyoruz
COPY ["ReisTeknikHirdavat.WebApi/ReisTeknikHirdavat.WebApi.csproj", "ReisTeknikHirdavat.WebApi/"]
COPY ["ReisTeknikHirdavat.Application/ReisTeknikHirdavat.Application.csproj", "ReisTeknikHirdavat.Application/"]
COPY ["ReisTeknikHirdavat.Domain/ReisTeknikHirdavat.Domain.csproj", "ReisTeknikHirdavat.Domain/"]
COPY ["ReisTeknikHirdavat.Persistence/ReisTeknikHirdavat.Persistence.csproj", "ReisTeknikHirdavat.Persistence/"]
COPY ["ReisTeknikHirdavat.Infrastructure/ReisTeknikHirdavat.Infrastructure.csproj", "ReisTeknikHirdavat.Infrastructure/"]

RUN dotnet restore "ReisTeknikHirdavat.WebApi/ReisTeknikHirdavat.WebApi.csproj"
COPY . .
WORKDIR "/src/ReisTeknikHirdavat.WebApi"
RUN dotnet build "ReisTeknikHirdavat.WebApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ReisTeknikHirdavat.WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ReisTeknikHirdavat.WebApi.dll"]