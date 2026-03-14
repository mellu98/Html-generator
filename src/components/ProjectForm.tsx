import { cloneFieldDefault } from '../schema'
import type {
  ProjectData,
  ProjectListKey,
  ProjectScalarKey,
  TemplateSchema,
} from '../types'
import { FieldControl, ListFieldControl } from './FieldControl'

interface ProjectFormProps {
  schema: TemplateSchema
  projectData: ProjectData
  onScalarChange: (key: ProjectScalarKey, value: string | boolean) => void
  onListChange: (
    key: ProjectListKey,
    value: Array<Record<string, string>>,
  ) => void
  onResetField: (key: ProjectScalarKey | ProjectListKey, value: unknown) => void
}

export function ProjectForm({
  schema,
  projectData,
  onScalarChange,
  onListChange,
  onResetField,
}: ProjectFormProps) {
  return (
    <div className="form-stack">
      {schema.sections.map((section, sectionIndex) => (
        <details className="form-section" key={section.id} open={sectionIndex < 2}>
          <summary className="form-section__summary">
            <div>
              <strong>{section.title}</strong>
              <span>{section.description}</span>
            </div>
          </summary>

          <div className="form-section__body">
            {section.fields.map((field) => (
              <div className="field-block" key={field.key}>
                {field.type === 'list' ? (
                  <ListFieldControl
                    field={field}
                    items={projectData[field.key]}
                    onChange={(value) => onListChange(field.key, value)}
                  />
                ) : (
                  <FieldControl
                    field={field}
                    value={projectData[field.key]}
                    onChange={(value) => onScalarChange(field.key, value)}
                  />
                )}

                <div className="field-block__footer">
                  <button
                    className="link-button"
                    type="button"
                    onClick={() => onResetField(field.key, cloneFieldDefault(field))}
                  >
                    Ripristina default sezione
                  </button>
                </div>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}
