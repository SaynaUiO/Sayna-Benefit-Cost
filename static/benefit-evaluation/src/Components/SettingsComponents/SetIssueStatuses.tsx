import React, { useState, useEffect, useContext } from "react";
import Select from "@atlaskit/select";
import Button, { LoadingButton } from "@atlaskit/button";
import { Inline, Stack, xcss } from "@atlaskit/primitives";
import { useAppContext, ScopeTypeEnum } from "../../Contexts/AppContext";
import { IssueStatus } from "../../Models/IssueTypeModel";
import { useAPI } from "../../Contexts/ApiContext";

type value = {
  label: string;
  value: string;
};

type SetIssueStatusesProps = {
  onSave?: () => void;
};

export const SetIssueStatuses = (props: SetIssueStatusesProps) => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const [issueStatuses, setIssueStatuses] = useState<IssueStatus[]>();
  const [options, setOptions] = useState<value[]>([]);
  const [selectedIssueStatuses, setSelectedIssueStatuses] = useState<value[]>();

  const [scope] = useAppContext();
  const api = useAPI();

  const fetch = async () => {
    if (scope.type === ScopeTypeEnum.PROJECT) {
      api.project
        .getSelectedIssueStatuses(scope.id)
        .then((response) => {
          setSelectedIssueStatuses(
            response.map((issueStatus: IssueStatus) => {
              return {
                label: issueStatus.name,
                value: issueStatus.id,
              };
            })
          );
        })
        .catch((error) => {
          console.error(error);
        });
      api.issueType
        .getAllIssueStatuses()
        .then((response) => {
          setOptions(
            response.map((issueType: any) => {
              return {
                label: issueType.name,
                value: issueType.id,
              };
            })
          );
          setIssueStatuses(response);
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          console.error(error);
        });
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const save = async () => {
    setLoading(true);
    setSubmitting(true);
    if (selectedIssueStatuses && selectedIssueStatuses.length > 0) {
      const issueStatusesIds = selectedIssueStatuses.map(
        (issueStatus): string => issueStatus.value
      );
      api.project
        .setSelectedIssueStatuses(scope.id, issueStatusesIds)
        .then(() => {
          fetch()
            .then(() => {
              setLoading(false);
              if (props.onSave) {
                props.onSave();
              }
              setSubmitting(false);
            })
            .catch((error) => {
              console.error(error);
              setSubmitting(false);
            });
        })
        .catch((error) => {
          console.error(error);
          setSubmitting(false);
        });
    }
  };

  return (
    <Stack space="space.100">
      <h4>Velg Issue status</h4>
      <Select
        inputID="single-select-example"
        className="single-select"
        classNamePrefix="react-select"
        value={selectedIssueStatuses}
        isLoading={isLoading}
        isMulti
        onChange={(value) => {
          setSelectedIssueStatuses(value as value[]);
        }}
        options={options}
        placeholder="Velg Epic Issuetype"
      />
      <Inline
        xcss={xcss({ marginTop: "space.100" })}
        space={"space.100"}
        alignInline={"end"}
      >
        <LoadingButton
          onClick={() => save()}
          type="submit"
          appearance="primary"
          isLoading={isSubmitting}
          isDisabled={
            isLoading ||
            !selectedIssueStatuses ||
            selectedIssueStatuses.length === 0
          }
        >
          Lagre
        </LoadingButton>
      </Inline>
    </Stack>
  );
};
