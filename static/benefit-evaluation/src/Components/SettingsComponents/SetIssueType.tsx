import React, { useState, useEffect, useRef } from "react";
import Select from "@atlaskit/select";
import { LoadingButton } from "@atlaskit/button";
import { Inline, Stack, xcss } from "@atlaskit/primitives";
import { useAppContext, ScopeTypeEnum } from "../../Contexts/AppContext";
import { IssueType, GoalTierTypeEnum } from "../../Models";
import { useAPI } from "../../Contexts/ApiContext";
import { Issue } from "../../Models";
import { PreviewIssueTable } from "./PreviewIssueTable";

type value = {
  label: string;
  value: string;
};

type SetEpicIssueTypeProps = {
  onSave?: () => void;
};

export const SetIssueType = (props: SetEpicIssueTypeProps) => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
  const [options, setOptions] = useState<value[]>([]);
  const [selectedIssueType, setSelectedIssueType] = useState<value>();

  const [previewItems, setPreviewItems] = useState<Issue[]>();
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const initialRender = useRef(true);

  const [scope] = useAppContext();
  const api = useAPI();

  const fetch = async () => {
    if (scope.type === ScopeTypeEnum.PROJECT) {
      api.project
        .getSelectedIssueType(scope.id)
        .then((selectedEpicIssueType) => {
          setSelectedIssueType({
            label: selectedEpicIssueType.name,
            value: selectedEpicIssueType.id,
          });
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
        });
      api.issueType
        .getAllIssueTypes()
        .then((response) => {
          setOptions(
            response.map((issueType: any) => {
              return {
                label: issueType.name,
                value: issueType.id,
              };
            })
          );
          setIssueTypes(response);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  useEffect(() => {
    fetch();
    if (selectedIssueType)
      api.issue
        .getAllPreview()
        .then((response) => {
          setPreviewItems(response);
          setLoadingPreview(false);
        })
        .catch((error) => {
          console.error(error);
          setLoadingPreview(false);
        });
  }, []);

  useEffect(() => {
    async function fetchPreview() {
      setSubmitting(true);
      setLoadingPreview(true);
      if (selectedIssueType) {
        const issueType = issueTypes.find(
          (i) => i.id === selectedIssueType.value
        );
        if (issueType) {
          api.project
            .setSelectedIssueType(scope.id, selectedIssueType.value)
            .then(() => {
              setSubmitting(false);
              if (props.onSave) {
                props.onSave();
              }
              api.issue
                .getAllPreview()
                .then((response) => {
                  setPreviewItems(response);
                  setLoadingPreview(false);
                })
                .catch((error) => {
                  console.error(error);
                  setLoadingPreview(false);
                });
            })
            .catch((error) => {
              console.error(error);
              setSubmitting(false);
              setLoadingPreview(false);
            });
          return;
        }
      }
      console.error("something went wrong");
    }
    if (!initialRender.current) fetchPreview();
    initialRender.current = false;
  }, [selectedIssueType]);

  return (
    <>
      <Stack space="space.100">
        <h4>Valgt Issue Type</h4>
        <Select
          inputID="single-select-example"
          className="single-select"
          classNamePrefix="react-select"
          value={selectedIssueType}
          isLoading={isLoading}
          onChange={(value) => {
            if (value) {
              setSelectedIssueType(value!);
            }
          }}
          options={options}
          placeholder="Velg Epic Issuetype"
        />
        <Inline
          xcss={xcss({ marginTop: "space.100" })}
          space={"space.100"}
          alignInline={"end"}
        >
          {selectedIssueType && (
            <LoadingButton
              onClick={() => setPreviewOpen(true)}
              isLoading={loadingPreview}
            >
              Forhåndsvis {selectedIssueType?.label}s
            </LoadingButton>
          )}
        </Inline>
      </Stack>
      <PreviewIssueTable
        issues={previewItems!!}
        isOpen={previewOpen}
        setOpen={setPreviewOpen}
        loadingPreview={loadingPreview}
        issueType={selectedIssueType?.label + "s"}
      />
    </>
  );
};
