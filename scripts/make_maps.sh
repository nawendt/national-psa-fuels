#!/usr/bin/env bash

MAIN=`pwd`
ROOT="$MAIN"

INDIR="$ROOT/input"

OUTDIR="$ROOT/output"

# Input Files
INpsa="$INDIR/psa.shp"
INstates="$INDIR/states.shp"

# Output Files
OUTstates="$OUTDIR/states.json"
OUTgacc="$OUTDIR/gacc.json"
OUTpsa="$OUTDIR/psa.json"

### Make Directories ###
mkdir -p $OUTDIR $TMPDIR

# Clip PSA using state bounds
mapshaper -i $INpsa \
    -rename-fields "PSANationalCode=PSANationa" \
    -filter "PSANationalCode != 'None' && PSANAME.includes('PR') == false" \
    -filter-fields "PSANAME,PSANationalCode,GACCName,GACCUnitID" \
    -clip $INstates \
    -simplify 5% \
    -clean \
    -o $OUTpsa format=topojson precision=0.001 force 

# Create GACC bounds using PSA features
mapshaper -i $INpsa \
    -dissolve "GACCName" copy-fields="GACCUnitID"\
    -simplify 5% \
    -rename-layers gacc \
    -clean \
    -o $OUTgacc format=topojson precision=0.001 force 

# Convert states to topojson
mapshaper -i $INstates \
    -filter-fields "postal" \
    -drop holes \
    -simplify 5% \
    -clean \
    -o $OUTstates format=topojson precision=0.001 force 
