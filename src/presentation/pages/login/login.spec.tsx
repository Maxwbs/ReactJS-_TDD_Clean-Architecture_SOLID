import React from 'react'
import { Router} from 'react-router-dom'
import { createMemoryHistory } from 'history'
import faker from 'faker'
import 'jest-localstorage-mock'
import { render, RenderResult, fireEvent, cleanup, waitFor } from '@testing-library/react'
import Login from './login'
import { ValidationStub, AuthenticationSpy } from '@/presentation/test'
import { InvalidCredentialsError } from '@/domain/errors'

type SutTypes = {
    sut: RenderResult,
    authenticationSpy: AuthenticationSpy
}

type SutParams = {
    validationError: string
}

const history = createMemoryHistory({ initialEntries: ['/login']})

const makeSut = (params?: SutParams): SutTypes => {
    const validationStub = new ValidationStub()  
    const authenticationSpy = new AuthenticationSpy()
    validationStub.errorMessage = params?.validationError

    const sut = render(
        <Router history={history}>
             <Login validation={validationStub} authentication={authenticationSpy} />
        </Router>
    )    
    
    return {
        sut,
        authenticationSpy
    }
}

const simulateValidSubmit = async (sut: RenderResult, email= faker.internet.email(), password = faker.internet.password()): Promise<void> => {
    populateEmailField(sut, email)  
    populatePasswordField(sut, password)      
    const form = sut.getByTestId('form')        
    fireEvent.click(form)
    await waitFor(() => form)
}

const populateEmailField = (sut: RenderResult, email= faker.internet.email()): void => {
    const emailInput = sut.getByTestId('email')
    fireEvent.input(emailInput, {target: { value: email}})         
}

const populatePasswordField = (sut: RenderResult, password= faker.internet.password()): void => {
    const passwordInput = sut.getByTestId('password')
    fireEvent.input(passwordInput, {target: { value: password}})          
}

const testStatusForField = (sut: RenderResult, fieldName: string, validationError?: string): void => {
    const emailStatus = sut.getByTestId(`${fieldName}-status`)
    expect(emailStatus.title).toBe(validationError || 'Sucesso')
    expect(emailStatus.textContent).toBe(validationError ? '🔴' : '✅')
}

describe('Login Component', () => {
    afterEach(cleanup)

    beforeEach(() => {
        localStorage.clear()
    })

    test('Teste  estado inicial do login.', () => {
        // Estado do spinner e error
        const validationError = faker.random.words()

        const { sut } = makeSut({ validationError })  
        const errorWrap = sut.getByTestId('erro-wrap')
        expect(errorWrap.childElementCount).toBe(0)

        // Botão login desabilitado
        const submitButton = sut.getByTestId('submit') as HTMLButtonElement
        expect(submitButton.disabled).toBe(true)
        
        // Teste de email
        testStatusForField(sut, 'email', validationError)
        
        // Teste de password
        testStatusForField(sut, 'password', validationError)       
    })

    test('Testando email error ', () => {
        // Estado do spinner e error
        const validationError = faker.random.words()
        const { sut } = makeSut({ validationError })          
        populateEmailField(sut)          
        testStatusForField(sut, 'email', validationError)     
    })

    test('Testando password error ', () => {
        // Estado do spinner e error
        const validationError = faker.random.words()
        const { sut } = makeSut({ validationError })
        populatePasswordField(sut)         
        const passwordStatus = sut.getByTestId('password-status')
        expect(passwordStatus.title).toBe(validationError)
        expect(passwordStatus.textContent).toBe('🔴')        
    })

    test('Test login sucesso password.', () => {
        // Estado do spinner e error
        const { sut } = makeSut()   
        populatePasswordField(sut)       
        const passwordStatus = sut.getByTestId('password-status')
        expect(passwordStatus.title).toBe('Sucesso')
        expect(passwordStatus.textContent).toBe('✅')        
    })

    test('Test login button válido', () => {
        // Estado do spinner e error
        const { sut } = makeSut() 
        populateEmailField(sut)
        populatePasswordField(sut)  
        const submitButton = sut.getByTestId('submit') as HTMLButtonElement
        expect(submitButton.disabled).toBe(false)       
    })

    test('Test login spinner', async () => {
        // Estado do spinner e error
        const { sut } = makeSut() 
        await simulateValidSubmit(sut)
        const spinnerLodin = sut.getByTestId('spinner') 
        expect(spinnerLodin).toBeTruthy()     
    })

    test('Test autenticação do login.', async () => {
        // Estado do spinner e error
        const { sut, authenticationSpy } = makeSut() 
        const email = faker.internet.email()
        const password = faker.internet.password()
        await simulateValidSubmit(sut, email, password)
        expect(authenticationSpy.params).toEqual({
            email,
            password
        })     
    })

    test('Test autenticação do login, com varios click.', async () => {
        const { sut, authenticationSpy } = makeSut() 
        await simulateValidSubmit(sut)
        await simulateValidSubmit(sut)

        expect(authenticationSpy.callsCount).toBe(1)
    })

    test('Test autenticação do login, com o form invalido.', () => {
        const validationError = faker.random.words()
        const { sut, authenticationSpy } = makeSut({ validationError })         
        populateEmailField(sut)       
        fireEvent.submit(sut.getByTestId('form'))       
        expect(authenticationSpy.callsCount).toBe(0)
    })

    test('Test autenticação do login, autenticação com error.', async () => {                   
        const { sut, authenticationSpy } = makeSut()      
        const error = new InvalidCredentialsError()        
        jest.spyOn(authenticationSpy, 'auth').mockResolvedValueOnce(Promise.reject(error))
        await simulateValidSubmit(sut)   
        const errorWrap = sut.getByTestId('erro-wrap')        
        const mainError = sut.getByTestId('main-error') 
        expect(mainError.textContent).toBe(error.message)
        expect(errorWrap.childElementCount).toBe(1)
    })

    test('Test autenticação do login, acessToken em localStorage Sucesso.', async () => {                   
        const { sut, authenticationSpy } = makeSut()    
        await simulateValidSubmit(sut)  
        expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', authenticationSpy.account.accessToken)
        expect(history.length).toBe(1)
        expect(history.location.pathname).toBe('/')
    })

    test('Test autenticação do login, ir para pagina signup.', async () => {                   
        const { sut } = makeSut()    
        const register = sut.getByTestId('signup')
        fireEvent.click(register)
        expect(history.length).toBe(2)
        expect(history.location.pathname).toBe('/signup')
    })    
})