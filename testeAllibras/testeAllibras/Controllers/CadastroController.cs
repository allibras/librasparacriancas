using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using testeAllibras.Model;

namespace testeAllibras.Controllers;

[ApiController]
[Route("[controller]")]
public class CadastroController : ControllerBase
{
    private readonly ILogger<CadastroController> _logger;

    private const string ConnectionString =
        "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=Allibras;Integrated Security=True;Connect Timeout=30;Encrypt=False;Trust Server Certificate=False;Application Intent=ReadWrite;Multi Subnet Failover=False";

    public CadastroController(ILogger<CadastroController> logger)
    {
        _logger = logger;
    }

    [HttpPost]
    public IActionResult CreateCadastro([FromBody] Responsavel responsavel)
    {
        using (SqlConnection connection = new SqlConnection(ConnectionString))
        {
            connection.Open();

            using (SqlTransaction transaction = connection.BeginTransaction())
            {
                try
                {
                    // A query agora retorna o ID recém inserido
                    string insertCadastro = @"
                        INSERT INTO Responsavel (nome, email, senha)
                        OUTPUT INSERTED.Id
                        VALUES (@Nome, @Email, @Senha)";

                    using (SqlCommand command = new SqlCommand(insertCadastro, connection, transaction))
                    {
                        command.Parameters.AddWithValue("@Nome", responsavel.Nome);
                        command.Parameters.AddWithValue("@Email", responsavel.Email);
                        command.Parameters.AddWithValue("@Senha", responsavel.Senha);

                        // Executa o comando e obtém o ID
                        int novoId = (int)command.ExecuteScalar();

                        transaction.Commit();
                        return Ok(new
                        {
                            message = "Cadastro realizado com sucesso",
                            id = novoId
                        });
                    }
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    return StatusCode(500,
                        "Erro ao cadastrar: " + ex.Message);
                }
            }
        }
    }
}
