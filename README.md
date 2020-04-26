# Block-aligned File Read/Writer

For writing and reading block-aligned files. Each page has a header with an
optional schema name and pointers to each record in the page.

## Format

The first 8 bytes of each page are the fixed-length header. The rest of the
header is information about the location of each record in the page, encoded
as a Protocol Buffer with its schema defined in
`src/lib/schema/RecordPointers.proto`.

The rest of the page is arbitrary 'records' of bytes, filled in backwards from
the end of the page. Each row is accessed by reading its offset within the file
and its byte length, specified in the header.

## API

TODO
