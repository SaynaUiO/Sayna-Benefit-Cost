import React, { useState, useEffect } from 'react'
import { Issue } from '../../Models'
import Modal, {
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
    ModalTransition,
} from '@atlaskit/modal-dialog'
import Button from '@atlaskit/button'
import DynamicTable from '@atlaskit/dynamic-table'
import type { RowType } from '@atlaskit/dynamic-table/types'

type PreviewIssueTableProps = {
    issues: Issue[]
    isOpen: boolean
    setOpen: (open: boolean) => void
    loadingPreview: boolean
    issueType: string | undefined
}

export const PreviewIssueTable = ({
    issues,
    isOpen,
    setOpen,
    loadingPreview,
    issueType,
}: PreviewIssueTableProps) => {
    const head = {
        cells: [
            {
                key: 'id',
                content: 'ID',
                isSortable: true,
            },
            {
                key: 'description',
                content: 'Description',
                isSortable: true,
            },
        ],
    }
    const [rows, setRows] = useState<RowType[]>([])
    useEffect(() => {
        if (issues !== undefined)
            setRows(
                issues.map((issue) => ({
                    key: issue.key,
                    cells: [
                        {
                            key: issue.key,
                            content: issue.key,
                        },
                        {
                            key: issue.description,
                            content: issue.description,
                        },
                    ],
                }))
            )
    }, [issues])

    return (
        <ModalTransition>
            {isOpen && (
                <Modal onClose={() => setOpen(false)}>
                    <ModalBody>
                        <DynamicTable
                            caption={`Preview Issues - ${issueType}`}
                            head={head}
                            rows={rows}
                            emptyView={
                                <div>
                                    No issues found, try another issue type
                                </div>
                            }
                            isLoading={loadingPreview}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            appearance="subtle"
                            onClick={() => setOpen(false)}
                        >
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
            )}
        </ModalTransition>
    )
}
