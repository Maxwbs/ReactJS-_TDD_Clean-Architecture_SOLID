export class UnexpectedError extends Error {
    constructor()
    {
        super('Algo de errado aconteceu. Tente em breve um novo acesso.')
        this.name = 'UnexpectedError'
    }
}
