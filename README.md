# Block-aligned File Read/Writer

For writing and reading block-aligned files. Each page has a header with an
optional schema name and pointers to each record in the page.

## Format

The first two bytes of each page indicate how many bytes the header contains.
The rest of the header is encoded as a Protocol Buffer with its schema defined
in `src/lib/schema/PageHeader.proto`.

The rest of the page is arbitrary 'rows' of bytes, filled in backwards from
the end of the page. The PageHeader contains an array of pointers to these
rows in order. Each row is specified to span from its pointer until the byte
preceding the pointer of the previous row. The first row spans from its pointer
until the end of the page.
