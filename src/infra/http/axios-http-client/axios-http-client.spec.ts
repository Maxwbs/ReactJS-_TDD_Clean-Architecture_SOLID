import { AxiosHttpClient } from "./axios-http-client"
import { mockAxios } from "@/infra/test"
import { mockPostRequest } from "@/data/test/mock-http-Post"
import axios from 'axios'

jest.mock('axios')

type SutTypes = {
    sut: AxiosHttpClient
    mockedAxios: jest.Mocked<typeof axios>
}

const makeSut = (): SutTypes =>
{
    const sut = new AxiosHttpClient()
    const mockedAxios =  mockAxios()

    return {
        sut,
        mockedAxios
    }
}


describe('AxiosHttpClient', () =>
{
    test('Test Chamada correta da URL e verbo do post e body', async ()=> {
        const request = mockPostRequest()
        const { sut, mockedAxios } = makeSut()
        await sut.post(request)
        expect(mockedAxios.post).toHaveBeenCalledWith(request.url, request.body)
    })

    test('Test retorno correto do status code do body', async ()=> {
        const { sut, mockedAxios } = makeSut()
        const promise =  await sut.post(mockPostRequest())
        //expect(promise).toEqual(mockedAxios.post.mock.results[0].value)
    })
})

