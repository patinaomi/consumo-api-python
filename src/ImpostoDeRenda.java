public class ImpostoDeRenda {
    private float salario;

    public void calculoImposto (float salario) {
        if(salario < 1903.98) {
            System.out.println("Não hé dedução de renda");
        } else if (salario > 1903.99 && salario < 2826.65 ) {
            System.out.println("Dedução de 7,5% " + (salario * 0.075));
            } else if(salario > 2826.66 && salario < 3751.05) {
                System.out.println("Dedução de 7,5% " + (salario * 0.15));
            } else if(salario > 3751.06 && salario < 4664.67) {
                System.out.println("Dedução de 15% " + (salario * 0.225));
        } if(salario > 4664.68) {
                System.out.println("Dedução de 22,5% " + (salario * 0.275));
            }
    }

    public float getSalario() {
        return salario;
    }

    public void setSalario(float salario) {
        this.salario = salario;
    }
}
