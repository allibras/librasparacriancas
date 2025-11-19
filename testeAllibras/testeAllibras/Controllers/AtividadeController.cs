using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using testeAllibras.Model;

namespace testeAllibras.Controllers;

[ApiController]
[Route("[controller]")]
public class AtividadeController : ControllerBase
{
    private readonly ILogger<AtividadeController> _logger;

    private const string ConnectionString = "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=Allibras;Integrated Security=True;Connect Timeout=30;Encrypt=False;Trust Server Certificate=False;Application Intent=ReadWrite;Multi Subnet Failover=False";

    public AtividadeController(ILogger<AtividadeController> logger)
    {
        _logger = logger;
    }

    [HttpPost]
    [Route("InserirAtividade")]
    public IActionResult InserirAtividade([FromBody] AtividadeResultado resultado)
    {
        using (SqlConnection connection = new SqlConnection(ConnectionString))
        {
            connection.Open();

            using (SqlTransaction transaction = connection.BeginTransaction())
            {
                try
                {
                    string insertAtividade = @"INSERT INTO AtividadeResultado (tempo, acertos, erros, moedas, fk_crianca)
                                    VALUES (@Tempo, @Acertos, @Erros, @Moedas, @Fk_Crianca)";
                    using (SqlCommand command = new SqlCommand(insertAtividade, connection, transaction))
                    {
                        command.Parameters.AddWithValue("@Tempo", resultado.Tempo);
                        command.Parameters.AddWithValue("@Acertos", resultado.Acertos);
                        command.Parameters.AddWithValue("@Erros", resultado.Erros);
                        command.Parameters.AddWithValue("@Moedas", resultado.Moedas);
                        command.Parameters.AddWithValue("@Fk_Crianca", resultado.Fk_Crianca);

                        command.ExecuteNonQuery();
                    }

                    UpdateInformacoesCrianca(resultado.Fk_Crianca, resultado.Acertos, resultado.Erros, resultado.Moedas, connection, transaction);

                    transaction.Commit();

                    return Ok("Seja o que Deus quiser");
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    return StatusCode(500, "Deu ruim: " + ex.Message);
                }
            }
        }
    }

    private void UpdateInformacoesCrianca(int Fk_Crianca, int Acertos, int Erros, int Moedas, SqlConnection connection, SqlTransaction transaction)
    {
        try
        {
            // Calculo do tempo medio de todas as atividades
            string calcularTempoMedio = @"SELECT AVG(CAST(DATEDIFF(SECOND, '00:00:00', tempo) AS FLOAT))
                                        FROM AtividadeResultado
                                        WHERE fk_crianca = @Fk_Crianca";
            double tempoMedioSegundos;
            using (SqlCommand command = new SqlCommand(calcularTempoMedio, connection, transaction))
            {
                command.Parameters.AddWithValue("@Fk_Crianca", Fk_Crianca);
                tempoMedioSegundos = (double)command.ExecuteScalar();
            }

            TimeSpan tempoMedio = TimeSpan.FromSeconds(tempoMedioSegundos);

            string updateAtividadeCrianca = @"UPDATE Crianca 
                                            SET 
                                                atividades_concluidas = atividades_concluidas + 1,
                                                acertos = acertos + @Acertos,
                                                erros = erros + @Erros,
                                                tempo_medio = @Tempo_Medio,
                                                moedas = moedas + @Moedas
                                            WHERE
                                                id = @Fk_Crianca";
            using (SqlCommand command = new SqlCommand(updateAtividadeCrianca, connection, transaction))
            {
                command.Parameters.AddWithValue("@Acertos", Acertos);
                command.Parameters.AddWithValue("@Erros", Erros);
                command.Parameters.AddWithValue("@Tempo_Medio", tempoMedio.ToString(@"hh\:mm\:ss"));
                command.Parameters.AddWithValue("@Moedas", Moedas);
                command.Parameters.AddWithValue("@Fk_Crianca", Fk_Crianca);

                command.ExecuteNonQuery();
            }
        }
        catch(Exception ex)
        {
            throw new Exception("Erro no update: " + ex.Message);
        }
    }
}