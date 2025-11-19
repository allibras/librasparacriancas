using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using testeAllibras.Model;

namespace testeAllibras.Controllers;

[ApiController]
[Route("[controller]")]

public class ResponsavelController : ControllerBase
{
    private readonly ILogger<LoginController> _logger;

    private const string ConnectionString = "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=Allibras;Integrated Security=True;Connect Timeout=30;Encrypt=False;Trust Server Certificate=False;Application Intent=ReadWrite;Multi Subnet Failover=False";

    public ResponsavelController(ILogger<LoginController> logger)
    {
        _logger = logger;
    }

    [HttpPut("{id}")] // Atualiza dados do banco
    public ActionResult UpdateResponsavel(int id, [FromBody] Responsavel responsavel)
    {
        using(SqlConnection connection = new SqlConnection(ConnectionString))
        {

            connection.Open();

            using (SqlTransaction transaction = connection.BeginTransaction()) 
            {
                try
                {
                    string updateResponsavel = @"UPDATE responsavel SET nome = @Nome, email = @Email, senha = @Senha WHERE id = @Id";
                    using (SqlCommand command = new SqlCommand(updateResponsavel, connection, transaction))
                    {
                        command.Parameters.AddWithValue("@Nome", responsavel.Nome);
                        command.Parameters.AddWithValue("@Email", responsavel.Email);
                        command.Parameters.AddWithValue("@Senha", responsavel.Senha);
                        command.Parameters.AddWithValue("@Id", id);

                        command.ExecuteNonQuery();
                    }

                    transaction.Commit();
                    return Ok("Fiquei com preguica de pesquisar uma frase pra ca");
                }
                catch (Exception ex) 
                {
                    transaction.Rollback();
                    return StatusCode(500, "tem que ver com os cara la" + ex.Message);
                }
            }   
        }
    }
}

