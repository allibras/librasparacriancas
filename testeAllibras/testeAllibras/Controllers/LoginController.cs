using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Transactions;
using testeAllibras.Model;

namespace testeAllibras.Controllers;

[ApiController]
[Route("[controller]")]
public class LoginController : ControllerBase
{
    private readonly ILogger<LoginController> _logger;

    private const string ConnectionString = "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=Allibras;Integrated Security=True;Connect Timeout=30;Encrypt=False;Trust Server Certificate=False;Application Intent=ReadWrite;Multi Subnet Failover=False";

    public LoginController(ILogger<LoginController> logger)
    {
        _logger = logger;
    }

    [HttpPost]
    public ActionResult<bool> ValidarLogin([FromBody] LoginRequest login)
    {
        using (SqlConnection connection = new SqlConnection(ConnectionString))
        {

            string validarLogin = "SELECT id FROM Responsavel WHERE Email = @Email AND Senha = @Senha";
            SqlCommand command = new SqlCommand(validarLogin, connection);
            command.Parameters.AddWithValue("@Email", login.Email);
            command.Parameters.AddWithValue("@Senha", login.Senha);
            connection.Open();

            SqlDataReader reader = command.ExecuteReader();

            if (reader.Read())
            {
                int id = reader.GetInt32(0);

                return Ok(new { id });
            }

        }
        return BadRequest(false);
    }

    [HttpGet("{id}", Name = "GetUserById")] // Ler dados do Banco -> Retorna dados (Usar no perfilControl
    public ActionResult GetUserById(int id)
    {
        using (SqlConnection connection = new SqlConnection(ConnectionString))
        {
            string query = "SELECT * FROM Login WHERE Id = @Id";
            SqlCommand command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@Id", id);
            connection.Open();

            SqlDataReader reader = command.ExecuteReader();

            if (reader.Read())
            {
                Login login = new Login
                {
                    Id = Convert.ToInt32(reader["Id"]),
                    Nome = reader["Nome"].ToString(),
                    CPF = reader["CPF"].ToString()
                };

                reader.Close();

                return Ok(login);
            }

            reader.Close();
        }

        return NotFound();
    }

    [HttpPut("{id}")] // Atualiza dados do banco
    public ActionResult UpdateLogin(int id, [FromBody] Login login)
    {
        using (SqlConnection connection = new SqlConnection(ConnectionString))
        {
            string query = "UPDATE login SET Nome = @Nome, CPF = @CPF WHERE Id = @Id";
            SqlCommand command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@Nome", login.Nome);
            command.Parameters.AddWithValue("@CPF", login.CPF);
            command.Parameters.AddWithValue("@Id", id);
            connection.Open();

            int rowsAffected = command.ExecuteNonQuery();

            if (rowsAffected > 0)
            {
                return Ok();
            }
        }

        return NotFound();
    }

    [HttpDelete("{id}")]
    public ActionResult DeleteLogin(int id)
    {
        using (SqlConnection connection = new SqlConnection(ConnectionString))
        {
            string query = "DELETE FROM login WHERE Id = @Id";
            SqlCommand command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@Id", id);
            connection.Open();

            int rowsAffected = command.ExecuteNonQuery();

            if (rowsAffected > 0)
            {
                return Ok();
            }
        }

        return NotFound();
    }

}
