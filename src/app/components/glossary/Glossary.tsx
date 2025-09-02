import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from "@mui/material";
import { useTranslate } from "../translate/TranslateContext";

interface GlossaryItem {
  termKey: string;
  descriptionKey: string;
  exampleKey: string;
}

export default function Glossary() {
  const { translate } = useTranslate();


  const terms = [
    "aggregation",
    "composition",
    "inheritance",
    "association",
    "dependency",
    "realization",
  ] ;


  const glossary: GlossaryItem[] = terms.sort((a, b) => a.localeCompare(b)).map((term) => ({
    termKey: term,
    descriptionKey: `${term}_description`,
    exampleKey: `${term}_example`,
  }));

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        {translate("glossary")}
      </Typography>

      {glossary.map(({ termKey, descriptionKey, exampleKey }) => (
        <Accordion key={termKey}>
          <AccordionSummary>
            <Typography variant="h6">{translate(termKey)}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: exampleKey ? 1 : 0 }}>
              {translate(descriptionKey)}
            </Typography>
            {exampleKey && (
              <Typography variant="body2" color="text.secondary">
                {translate(exampleKey)}
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
