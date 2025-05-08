import Button, { ButtonGroup, LoadingButton } from '@atlaskit/button'
import React, { Fragment, useState, useEffect, useContext } from 'react'
import Drawer from '@atlaskit/drawer'
import { useNavigate } from 'react-router'
import Form, {
    ErrorMessage,
    Field,
    FormFooter,
    FormHeader,
    FormSection,
    HelperMessage,
} from '@atlaskit/form'
import TextField from '@atlaskit/textfield'
import TextArea from '@atlaskit/textarea'
import { Portfolio } from '../../Models/PortfolioModel'
import { useAPI } from '../../Contexts/ApiContext'
import { ScopeTypeEnum, useAppContext } from '../../Contexts/AppContext'
import { token } from '@atlaskit/tokens'
import { G300 } from '@atlaskit/theme/colors'
import SuccessIcon from '@atlaskit/icon/glyph/check-circle'
import { useFlags } from '@atlaskit/flag'
import { useParams } from 'react-router-dom'

type data = {
    name: string
    description: string
}

type createPortfolioProps = {
    mode: 'create' | 'edit'
    onClose?: () => void
}

export const AdminPortfolio = (props: createPortfolioProps) => {
    const [isLoading, setLoading] = useState<boolean>(
        props.mode === 'edit' ? true : false
    )
    const [portfolio, setPortfolio] = useState<Portfolio>()

    const api = useAPI()

    const navigate = useNavigate()
    const [scope] = useAppContext()
    const { scopeId } = useParams()
    const { showFlag } = useFlags()

    const closeDrawer = (refresh: boolean) => {
        console.log('close drawer')
        if (props.onClose) props.onClose()
        else {
            if (refresh) navigate(0)
            else navigate(-1)
        }
    }

    useEffect(() => {
        console.log(scopeId)

        if (props.mode === 'edit' && scope.type && scopeId) {
            if (scope.type !== ScopeTypeEnum.PORTFOLIO) closeDrawer(false)
            api.portfolio
                .get(scopeId)
                .then((response) => {
                    console.log(response)
                    if (response === undefined) {
                        closeDrawer(false)
                    } else {
                        setPortfolio(response)
                        setLoading(false)
                    }
                })
                .catch((error) => {
                    console.error(error)
                    closeDrawer(false)
                })
        }
    }, [])

    const update = (portfolio: Portfolio, data: data) => {
        portfolio.name = data.name
        portfolio.description = data.description
        if (scopeId) {
            api.portfolio
                .update(scopeId, portfolio)
                .then((response) => {
                    showFlag({
                        icon: (
                            <SuccessIcon
                                label="Success"
                                primaryColor={token('color.icon.success', G300)}
                            />
                        ),
                        title: `Updated ${portfolio.name}`,
                        isAutoDismiss: true,
                    })
                    closeDrawer(true)
                })
                .catch((error) => {
                    console.error(error)
                    closeDrawer(false)
                })
        }
    }

    const create = (data: data) => {
        const newPortfolio: Portfolio = {
            id: 'pf0',
            name: data.name,
            description: data.description,
            type: ScopeTypeEnum.PORTFOLIO,
            portfolioItems: [],
        }
        api.portfolio
            .create(newPortfolio)
            .then((response) => {
                console.log(response)
                closeDrawer(false)
            })
            .catch((error) => {
                console.error(error)
            })
    }

    return (
        <Drawer onClose={() => closeDrawer(false)} isOpen={true}>
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div style={{ marginRight: '50px' }}>
                    <Form
                        onSubmit={(data: data) => {
                            console.log('form data', data)
                            return new Promise((resolve) => {
                                if (props.mode === 'edit' && portfolio) {
                                    update(portfolio, data)
                                } else {
                                    create(data)
                                }
                            })
                        }}
                    >
                        {({ formProps, submitting }) => (
                            <form {...formProps}>
                                <FormHeader
                                    title={
                                        props.mode === 'edit'
                                            ? 'Edit Portfolio'
                                            : 'Create Portfolio'
                                    }
                                    description="* indicates a required field"
                                />
                                <FormSection>
                                    <Field
                                        aria-required={true}
                                        name="name"
                                        label="Name"
                                        defaultValue={
                                            props.mode === 'edit'
                                                ? portfolio?.name
                                                : ''
                                        }
                                        isRequired
                                    >
                                        {({ fieldProps, error }) => (
                                            <Fragment>
                                                <TextField
                                                    autoComplete="off"
                                                    {...fieldProps}
                                                />
                                                {!error && (
                                                    <HelperMessage>
                                                        You can use letters,
                                                        numbers and periods.
                                                    </HelperMessage>
                                                )}
                                            </Fragment>
                                        )}
                                    </Field>
                                    <Field
                                        aria-required={true}
                                        name="description"
                                        defaultValue={
                                            props.mode === 'edit'
                                                ? portfolio?.description
                                                : ''
                                        }
                                        label="Description"
                                    >
                                        {({ fieldProps, error }: any) => (
                                            <Fragment>
                                                <TextArea {...fieldProps} />
                                                {!error && (
                                                    <HelperMessage>
                                                        You can use letters,
                                                        numbers and periods.
                                                    </HelperMessage>
                                                )}
                                                {error && (
                                                    <ErrorMessage>
                                                        {error}
                                                    </ErrorMessage>
                                                )}
                                            </Fragment>
                                        )}
                                    </Field>
                                </FormSection>

                                <FormFooter>
                                    <ButtonGroup>
                                        <Button
                                            appearance="subtle"
                                            onClick={() => closeDrawer(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <LoadingButton
                                            type="submit"
                                            appearance="primary"
                                            isLoading={submitting}
                                        >
                                            {props.mode === 'edit'
                                                ? 'Update'
                                                : 'Create'}
                                        </LoadingButton>
                                    </ButtonGroup>
                                </FormFooter>
                            </form>
                        )}
                    </Form>
                </div>
            )}
        </Drawer>
    )
}
