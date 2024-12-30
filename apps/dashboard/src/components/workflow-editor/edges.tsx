import { BaseEdge, Edge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { AddStepMenu } from './add-step-menu';
import { useWorkflowEditorContext } from './hooks';

export type AddNodeEdgeType = Edge<{ isLast: boolean; addStepIndex: number }>;

export function AddNodeEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = { isLast: false, addStepIndex: 0 },
  markerEnd,
}: EdgeProps<AddNodeEdgeType>) {
  const { addStep, isReadOnly } = useWorkflowEditorContext();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {!data.isLast && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              // everything inside EdgeLabelRenderer has no pointer events by default
              // if you have an interactive element, set pointer-events: all
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            {!isReadOnly && (
              <AddStepMenu
                onMenuItemClick={(stepType) => {
                  addStep(stepType, data.addStepIndex);
                }}
              />
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
