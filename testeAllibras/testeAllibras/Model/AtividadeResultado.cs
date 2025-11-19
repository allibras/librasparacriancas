namespace testeAllibras.Model
{
    public class AtividadeResultado
    {
        public int Id { get; set; }
        public int Fk_Crianca { get; set; }
        public TimeSpan Tempo { get; set; }
        public int Acertos { get; set; }
        public int Erros { get; set; }
        public int Moedas { get; set; }
    }
}
