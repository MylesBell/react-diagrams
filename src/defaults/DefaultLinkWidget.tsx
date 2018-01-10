import * as React from 'react';
import { LinkModel, PointModel } from '../Common';
import * as _ from 'lodash';
import { DiagramEngine } from '../DiagramEngine';

export interface DefaultLinkProps {
  color?: string;
  width?: number;
  link: LinkModel;
  smooth?: boolean;
  diagramEngine: DiagramEngine;
  pointAdded?: (point: PointModel, event) => any;
}

export interface DefaultLinkState {
  selected: boolean;
}

/**
 * @author Dylan Vorster
 */
export class DefaultLinkWidget extends React.Component<
  DefaultLinkProps,
  DefaultLinkState
> {
  public static defaultProps: DefaultLinkProps = {
    color: 'black',
    width: 3,
    link: null,
    engine: null,
    smooth: false,
    diagramEngine: null
  };

  constructor(props: DefaultLinkProps) {
    super(props);
    this.state = {
      selected: false
    };
  }

  generatePoint(pointIndex: number): JSX.Element {
    let x = this.props.link.points[pointIndex].x;
    let y = this.props.link.points[pointIndex].y;

    return (
      <g key={'point-' + this.props.link.points[pointIndex].id}>
        <circle
          cx={x}
          cy={y}
          r={5}
          className={
            'point pointui' +
            (this.props.link.points[pointIndex].isSelected() ? ' selected' : '')
          }
        />
        <circle
          onMouseLeave={() => {
            this.setState({ selected: false });
          }}
          onMouseEnter={() => {
            this.setState({ selected: true });
          }}
          data-id={this.props.link.points[pointIndex].id}
          data-linkid={this.props.link.id}
          cx={x}
          cy={y}
          r={15}
          opacity={0}
          className={'point'}
        />
      </g>
    );
  }

  generateLink(extraProps: any, id: string | number): JSX.Element {
    var Bottom = (
      <path
        className={
          this.state.selected || this.props.link.isSelected() ? 'selected' : ''
        }
        strokeWidth={this.props.width}
        stroke={this.props.color}
        {...extraProps}
        markerEnd="url(#arrow)"
      />
    );

    var Top = (
      <path
        strokeLinecap="round"
        onMouseLeave={() => {
          this.setState({ selected: false });
        }}
        onMouseEnter={() => {
          this.setState({ selected: true });
        }}
        data-linkid={this.props.link.getID()}
        stroke={this.props.color}
        strokeOpacity={this.state.selected ? 0.1 : 0}
        strokeWidth={20}
        onContextMenu={() => {
          if (!this.props.diagramEngine.isModelLocked(this.props.link)) {
            event.preventDefault();
            this.props.link.remove();
          }
        }}
        {...extraProps}
      />
    );

    return (
      <g key={'link-' + id}>
        {Bottom}
        {Top}
      </g>
    );
  }

  generateLinePath(firstPoint: PointModel, lastPoint: PointModel): string {
    return `M${firstPoint.x},${firstPoint.y} L ${lastPoint.x},${lastPoint.y}`;
  }

  generateCurvePath(
    firstPoint: PointModel,
    lastPoint: PointModel,
    firstPointDelta: number = 0,
    lastPointDelta: number = 0
  ): string {
    return `M${firstPoint.x},${firstPoint.y} C ${firstPoint.x +
      firstPointDelta},${firstPoint.y} ${lastPoint.x +
      lastPointDelta},${lastPoint.y} ${lastPoint.x},${lastPoint.y}`;
  }

  render() {
    //ensure id is present for all points on the path
    var points = this.props.link.points;
    var paths = [];
    let model = this.props.diagramEngine.getDiagramModel();

    //draw the smoothing
    if (points.length === 2) {
      var pointLeft = points[0];
      var pointRight = points[1];

      paths.push(
        this.generateLink(
          {
            d: this.generateLinePath(pointLeft, pointRight)
          },
          '0'
        )
      );
      if (this.props.link.targetPort === null) {
        paths.push(this.generatePoint(1));
      }
    } else {
      var ds = [];
      if (this.props.smooth) {
        var ds = [];
        for (var i = 0; i < points.length - 1; i++) {
          ds.push(this.generateLinePath(points[i], points[i + 1]));
        }
      }

      paths = ds.map((data, index) => {
        return this.generateLink(
          {
            'data-linkid': this.props.link.id,
            'data-point': index,
            d: data
          },
          index
        );
      });

      //render the circles
      for (var i = 1; i < points.length - 1; i++) {
        paths.push(this.generatePoint(i));
      }

      if (this.props.link.targetPort === null) {
        paths.push(this.generatePoint(points.length - 1));
      }
    }

    return <g>{paths}</g>;
  }
}
