import { HttpPostClientSpy } from '@/data/test/mock-http-client'
import { RemoteAuthentication } from "./remote-autjentication"
import { mockAccountModel, mockAuthentication } from '@/domain/test/mock-account'
import { InvalidCredentialsError, UnexpectedError } from '@/domain/errors'
import { HttpStatusCode } from '@/data/protocols/http'
import { AuthenticationParams } from '@/domain/usercases/authentication'
import { AccountModel } from '@/domain/models'
import faker from 'faker'

type SutTypes = 
{
    sut: RemoteAuthentication
    httpPostClientSpy: HttpPostClientSpy<AuthenticationParams, AccountModel>
}

const makeSut = (url: string = faker.internet.url()): SutTypes => 
{    
        const httpPostClientSpy = new HttpPostClientSpy<AuthenticationParams, AccountModel>()
        const sut = new RemoteAuthentication(url, httpPostClientSpy)
       
    return  {
        sut, 
        httpPostClientSpy
    }    
}

describe('RemoteAuthentication', () => 
{
    test('Should call HttpClient with correct URL', async () => 
    {
        const url = faker.internet.url()
        const {sut, httpPostClientSpy} = makeSut(url)
        await sut.auth(mockAuthentication())
        expect(httpPostClientSpy.url).toBe(url)
    })

    test('Should call HttpPostClient with correct body', async () => 
    {       
        const {sut, httpPostClientSpy} = makeSut()
        const authenticationParams = mockAuthentication()
        await sut.auth(authenticationParams)
        expect(httpPostClientSpy.body).toBe(authenticationParams)
    })

    test('Error de inválida credencial 401.', async () => 
    {       
        const {sut, httpPostClientSpy} = makeSut()        
        httpPostClientSpy.response.statusCode = HttpStatusCode.unauthorized
        const promise = sut.auth(mockAuthentication())
        await expect(promise).rejects.toThrow(new InvalidCredentialsError())
    })

    test('Error de UnexpectedError 400.', async () => 
    {       
        const {sut, httpPostClientSpy} = makeSut()        
        httpPostClientSpy.response.statusCode = HttpStatusCode.badRequest
        const promise = sut.auth(mockAuthentication())
        await expect(promise).rejects.toThrow(new UnexpectedError())
    })

    test('Error de serverError 500.', async () => 
    {       
        const {sut, httpPostClientSpy} = makeSut()        
        httpPostClientSpy.response.statusCode = HttpStatusCode.serverError
        const promise = sut.auth(mockAuthentication())
        await expect(promise).rejects.toThrow(new UnexpectedError())
    })

    test('Error de serverError 404.', async () => 
    {       
        const {sut, httpPostClientSpy} = makeSut()        
        httpPostClientSpy.response.statusCode = HttpStatusCode.notFound
        const promise = sut.auth(mockAuthentication())
        await expect(promise).rejects.toThrow(new UnexpectedError())
    })

    test('Error de sucess 200.', async () => 
    {       
        const {sut, httpPostClientSpy} = makeSut()     
        const httpResult = mockAccountModel();   
        httpPostClientSpy.response = {
            statusCode: HttpStatusCode.ok,
            body: httpResult
        }

        const account  = await sut.auth(mockAuthentication())
        await expect(account).toEqual(httpResult)
    })
})