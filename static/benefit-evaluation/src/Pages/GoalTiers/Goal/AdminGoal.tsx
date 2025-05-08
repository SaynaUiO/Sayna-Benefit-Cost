import Button, { ButtonGroup, LoadingButton } from '@atlaskit/button'
import React, { Fragment, useState, useEffect } from 'react'
import Drawer from '@atlaskit/drawer'
import { useNavigate, useParams } from 'react-router'
import Form, {
    ErrorMessage,
    Field,
    FormFooter,
    FormHeader,
    FormSection,
    HelperMessage,
} from '@atlaskit/form'
import TextArea from '@atlaskit/textarea'
import { useAppContext } from '../../../Contexts/AppContext'
import { Goal, GoalCollection } from '../../../Models'
import { useAPI } from '../../../Contexts/ApiContext'

type data = {
    description: string
}

type AdminGoalProps = {
    mode: 'create' | 'edit'
    close: () => void
    goal_tier_id: string
    goal_id?: string
    refresh: () => void
}

export const AdminGoal = (props: AdminGoalProps) => {
    const { mode, close, goal_tier_id, goal_id, refresh } = props

    const [goal, setGoal] = useState<Goal | undefined>(undefined)
    const [goalCollection, setGoalCollection] = useState<
        GoalCollection | undefined
    >(undefined)
    const [isLoading, setLoading] = useState<boolean>(
       mode === 'edit' ? true : false
    )

    const navigation = useNavigate()
    const [scope] = useAppContext()
    const api = useAPI()

    useEffect(() => {
        if (goal_tier_id) {
            api.goalCollection
                .get(scope.id, goal_tier_id)
                .then((response) => {
                    if (response) {
                        setGoalCollection(response)
                    } else {
                        closeDrawer(false)
                    }
                })
                .catch((error) => {
                    console.error(error)
                    closeDrawer(false)
                })
            if (props.mode === 'edit' && goal_id) {
                api.goal
                    .get(scope.id, goal_tier_id, goal_id)
                    .then((response) => {
                        if (response === undefined) {
                            closeDrawer(false)
                        } else {
                            setGoal(response)
                            setLoading(false)
                        }
                    })
                    .catch((error) => {
                        console.error(error)
                        closeDrawer(false)
                    })
            }
        } else {
            closeDrawer(false)
        }
    }, [])

    useEffect(() => {
        if (goalCollection) {
            if (props.mode === 'edit') {
                if (goal) {
                    setLoading(false)
                }
            } else {
                setLoading(false)
            }
        }
    }, [goalCollection, goal])

    const closeDrawer = (refresh: boolean) => {
        if (refresh) props.refresh()
        close()
    }

    return (
        <Drawer onClose={() => closeDrawer(false)} isOpen={true}>
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div style={{ marginRight: '50px' }}>
                    <Form<{ description: string }>
                        onSubmit={(data: data) => {
                            return new Promise((resolve) => {
                                if (props.mode === 'edit' && goal) {
                                    goal.description = data.description
                                    if (goalCollection) {
                                        api.goal
                                            .update(
                                                scope.id,
                                                goalCollection.id,
                                                goal
                                            )
                                            .then((response) => {
                                                closeDrawer(true)
                                            })
                                            .catch((error) => {
                                                console.error(error)
                                                closeDrawer(false)
                                            })
                                    }
                                } else {
                                    if (goalCollection) {
                                        api.goal
                                            .create(
                                                scope.id,
                                                goalCollection.id,
                                                data.description
                                            )
                                            .then((response) => {
                                                closeDrawer(true)
                                            })
                                            .catch((error) => {
                                                console.error(error)
                                                closeDrawer(false)
                                            })
                                    }
                                }
                            })
                        }}
                    >
                        {({ formProps, submitting }) => (
                            <form {...formProps}>
                                <FormHeader
                                    title={
                                        props.mode === 'edit'
                                            ? `Edit Goal ${goal?.key}`
                                            : 'Create Goal'
                                    }
                                    description="* indicates a required field"
                                />
                                <FormSection>
                                    <Field
                                        aria-required={true}
                                        name="description"
                                        label="Goal Description"
                                        isRequired
                                        defaultValue={
                                            props.mode === 'edit'
                                                ? goal?.description
                                                : ''
                                        }
                                        validate={(value) =>
                                            value && value.length < 8
                                                ? 'TOO_SHORT'
                                                : undefined
                                        }
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
