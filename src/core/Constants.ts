/**
 * @const
 * Specifies names and schema XML for the SharePoint fields in a glossary list
 */
export const TermFields = 
{
    "Definition": { 
        "Name": "ncGlossaryDefinition",
        "SchemaXml": '<Field Name="ncGlossaryDefinition" StaticName="ncGlossaryDefinition" DisplayName="ncGlossaryDefinition" Type="Note" RichText="TRUE" RichTextMode="FullHtml" Required="FALSE" />' 
        },
    "Synonyms":  { 
        "Name": "ncGlossarySynonyms",
        "SchemaXml": '<Field Name="ncGlossarySynonyms" StaticName="ncGlossarySynonyms" DisplayName="ncGlossarySynonyms" Type="Note" RichText="FALSE" Required="FALSE"/>'
    }
};

/**
 * @const
 * Used in the Quill HTML Editor
 */
export const EditorConstants =
{
    "MaxTermTitleLength": 100,
    "MaxTermDefinitionLength": 4000,
    "MaxNumberOfSynonyms": 5,
    "EditorEmptyText": "<p><br></p>"
};