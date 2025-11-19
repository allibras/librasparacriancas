namespace testeAllibras.Model
{
    public class CriancaPerfil
    {
        public int Id { get; set; }
        public int Fk_Responsavel { get; set; }
        public string Nome { get; set; }
        public DateTime Data_Nascimento { get; set; }
        public string Apelido { get; set; }
        public string Parentesco { get; set; }
        public string Serie_Escolar { get; set; }
    }

    public class CriancaPerfilReduzido
    {
        public int Id { get; set; }
        public string Nome { get; set; }
    }
}
