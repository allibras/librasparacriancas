using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using testeAllibras.Model;

namespace testeAllibras.Controllers;

[ApiController]
[Route("[controller]")]
public class PerfilController : ControllerBase
{
    private readonly ILogger<PerfilController> _logger;

    private const string ConnectionString = "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=Allibras;Integrated Security=True;Connect Timeout=30;Encrypt=False;Trust Server Certificate=False;Application Intent=ReadWrite;Multi Subnet Failover=False";

    public PerfilController(ILogger<PerfilController> logger)
    {
        _logger = logger;
    }

    [HttpPost]
    public IActionResult CreatePerfil([FromBody] CriancaPerfil crianca)
    {
        using (SqlConnection connection = new SqlConnection(ConnectionString))
        {
            connection.Open();

            using (SqlTransaction transaction = connection.BeginTransaction())
            {
                try
                {
                    string insertPerfil = @"INSERT INTO Crianca (nome, data_nascimento, apelido, parentesco, serie_escolar, fk_responsavel) 
                                            VALUES (@Nome, @Data_Nascimento, @Apelido, @Parentesco, @Serie_Escolar, @Fk_Responsavel)";
                    using (SqlCommand command = new SqlCommand(insertPerfil, connection, transaction))
                    {
                        command.Parameters.AddWithValue("@Nome", crianca.Nome);
                        command.Parameters.AddWithValue("@Data_Nascimento", crianca.Data_Nascimento);
                        command.Parameters.AddWithValue("@Apelido", crianca.Apelido);
                        command.Parameters.AddWithValue("@Parentesco", crianca.Parentesco);
                        command.Parameters.AddWithValue("@Serie_Escolar", crianca.Serie_Escolar);
                        command.Parameters.AddWithValue("@Fk_Responsavel", crianca.Fk_Responsavel);
                        

                        command.ExecuteNonQuery();
                    }

                    transaction.Commit();
                    return Ok("Os cara sairam...");
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    return StatusCode(500, "Os cara tao na maldade querendo pegar a minha Makita: " + ex.Message);
                }
            }
        }
    }

    [HttpGet("{fk_responsavel}", Name = "GetPerfilById")] // Ler dados do Banco -> Retorna dados (Usar no perfilControl
    public IActionResult GetPerfilById(int fk_responsavel)
    {

        var perfis = new List<CriancaPerfilReduzido>();

        using (SqlConnection connection = new SqlConnection(ConnectionString))
        {
            string query = "SELECT Id, Nome FROM Crianca WHERE fk_responsavel = @Id";
            SqlCommand command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@Id", fk_responsavel);
            connection.Open();

            SqlDataReader reader = command.ExecuteReader();

            while (reader.Read())
            {
                var perfil = new CriancaPerfilReduzido
                {
                    Id = Convert.ToInt32(reader["Id"]),
                    Nome = reader["Nome"].ToString()
                };

                perfis.Add(perfil);
            }

            reader.Close();
        }

        if (perfis.Count == 0) 
        {
            return NotFound("Nenhuma criança encontrada para este responsável.");
        }

        return Ok(perfis);
    }
}
