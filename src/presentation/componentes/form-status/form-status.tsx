import React, { useContext } from 'react';
import Styles from './form-status-styles.scss'
import Spinner from '@/presentation/componentes/spinner/spinner'
import Context from '@/presentation/contexts/form/form-context'

type Props = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

const FormStatus: React.FC<Props> = (props: Props) =>{
    const { state } = useContext(Context)
    const { isLoading, mainError } = state

    return (
        <div data-testid="erro-wrap" className={Styles.erroWrap}>
                { isLoading && <Spinner  className={Styles.spinner}/> }
                { mainError && <span data-testid="main-error" className={Styles.error}>{mainError}</span> }
        </div>
    )
}

export default FormStatus
