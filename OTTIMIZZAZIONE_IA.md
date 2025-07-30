# Piano di Ottimizzazione per IA e E-E-A-T

Questo documento riassume le prossime possibili ottimizzazioni per migliorare la leggibilità del sito da parte delle IA e per rafforzare i segnali di E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).

## 1. Arricchire lo Schema `Person`

**Obiettivo:** Fornire dati strutturati più dettagliati per comunicare competenza e autorevolezza.

**Azioni:**
- Aggiornare `alumniOf` con il nome specifico dell'istituto di formazione.
- Aggiornare `worksFor` con un datore di lavoro specifico (se applicabile).
- Rendere più specifiche le voci in `knowsAbout` per allinearle con le competenze elencate.

## 2. Espandere la Sezione "Su di Me"

**Obiettivo:** Dimostrare esperienza diretta (la "E" di E-E-A-T) attraverso una narrazione più completa.

**Azioni:**
- Sviluppare 2-3 paragrafi che descrivano il percorso professionale, le aree di specializzazione e la filosofia di problem-solving.
- Integrare il nuovo testo nel file `data/translations.json`.

## 3. Aggiungere una Pagina di Privacy Policy

**Obiettivo:** Aumentare la fiducia (la "T" di E-E-A-T) e la professionalità del sito.

**Azioni:**
- Creare un nuovo file `privacy.html` con un testo di policy di base.
- Aggiungere un link alla pagina della privacy nel footer del sito.
