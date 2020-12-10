import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from 'styled-components';
import { FormDown } from 'grommet-icons/icons/FormDown';
import { FormNext } from 'grommet-icons/icons/FormNext';
import { FormPrevious } from 'grommet-icons/icons/FormPrevious';

import { Box } from '../Box';
import { Button } from '../Button';
import { List } from '../List';
import { Text } from '../Text';

const Tree = ({ children, mode, data }) => {
  const theme = useContext(ThemeContext);

  // The number of levels from the root, while the root is level zero.
  const [depth, setDepth] = useState(0); // initializing to root level
  // an array of the path names
  const [path, setPath] = useState([]);
  const [selectedNode, setSelectedNode] = useState();
  // treeLevelData is an array of objects from the 'depth' level,
  // and would eventually be translated to a List.
  // treeLevelData should only be updated on useEffect to reflect correct depth
  const [treeLevelData, setTreeLevelData] = useState(data);
  // parentLevel should only be updated on useEffect to reflect correct depth
  const [parentLevel, setParentLevel] = useState();

  useEffect(() => {
    let level = data;
    let parent;
    for (let i = 0; i < depth; i += 1) {
      // follow the breadcrumbs path
      parent = level.find(element => element.name === path[i]);
      level = parent.children;
    }
    setParentLevel(parent);
    setTreeLevelData(level);
  }, [path, data, depth]);

  const ColumnNavigationList = () => (
    <Box width="medium">
      <List
        data={treeLevelData}
        onClickItem={event => setSelectedNode(event.item)}
        {...theme.tree.column.listProps}
      >
        {datum => {
          return (
            <Box direction="row" justify="between" align="center" gap="small">
              <Text size="small">{datum.name}</Text>
              <Box direction="row" gap="hair" align="center">
                <Text size="xsmall">
                  {datum?.children?.length &&
                    `${datum.children.length} sub-resources`}
                </Text>
                <FormNext />
              </Box>
            </Box>
          );
        }}
      </List>
    </Box>
  );

  const NestedNavigationList = () => (
    <List
      data={treeLevelData}
      onClickItem={event => {
        setSelectedNode(event.item);
      }}
      {...theme.tree.nested.listProps}
    >
      {datum => {
        return (
          <Box direction="row" align="center" gap="small">
            {selectedNode === datum ? <FormDown /> : <FormNext />}
            <Text size="small">{datum.name}</Text>
            {/* TODO
            The concept of "nested" differs from  "column" 
            by the following implementations aspects: 
            1. selectedNode should be an array instead of a single value
            2. focus should be per List item which isn't achievable via List
            3. treeLevel and parentLevel are no longer relevant
            4. concept of depth is no longer relevant as we may have 'multiple' 
            5. should we consider leverage the existing mechanism of Collapsible
            */}
          </Box>
        );
      }}
    </List>
  );

  let content;
  if (mode === 'column') {
    content = (
      <Box align="start" gap="medium">
        {/* Breadcrumbs */}
        {depth > 0 && path.length > 0 && (
          <Button
            a11yTitle={path[path.length - 1]}
            label={
              <Text style={{ textDecoration: 'underline' }} size="small">
                {path[path.length - 1]}
              </Text>
            }
            icon={<FormPrevious />}
            plain
            onClick={() => {
              // remove the last breadcrumb item when Previous is selected
              path.pop();
              setPath(path);
              setDepth(depth - 1);
              setSelectedNode(parentLevel);
            }}
          />
        )}
        {/* Layout Containers for List and user content */}
        <Box direction="row" border width="large">
          <ColumnNavigationList />
          <Box border="left" align="start" gap="large" pad="medium">
            {selectedNode && children(selectedNode)}
            {selectedNode?.children?.length > 0 && (
              <Button
                a11yTitle={`${selectedNode.children.length} sub-resources`}
                plain
                label={
                  <Text size="small">
                    {`${selectedNode.children.length} sub-resources`}
                  </Text>
                }
                icon={<FormNext />}
                reverse
                onClick={() => {
                  // add a new selected entry to the breadcrumbs path
                  setPath([...path, selectedNode.name]);
                  setSelectedNode(undefined);
                  setDepth(depth + 1);
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    );
  } else {
    content = (
      <Box align="start">
        <NestedNavigationList />
      </Box>
    );
  }

  return content;
};

Tree.displayName = 'Tree';

let TreeDoc;
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  TreeDoc = require('./doc').doc(Tree);
}
const TreeWrapper = TreeDoc || Tree;

export { TreeWrapper as Tree };