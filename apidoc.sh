#!/bin/bash

OUT_PATH="./views/docs"

# read -p "Created ApiDoc Path : " CREATED_DOC_ROOT
echo "Document Create Path : " $OUT_PATH
apidoc -i routes/ -o $OUT_PATH

#cd $CREATED_DOC_ROOT
#echo "move directory : $CREATED_DOC_ROOT"
#sh $CREATED_DOC_ROOT$DEPLOY_SH
#echo "run script : $CREATED_DOC_ROOT$DEPLOY_SH"
#cd $CURR_PATH
