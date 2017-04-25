import React, { Component, PropTypes, Children } from 'react';
import ReactDOM from 'react-dom';
import { throttle } from 'utils/helpers';

export default class Observer extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(React.PropTypes.node),
      PropTypes.node
    ]).isRequired,
    onMeasure: PropTypes.func,
    container: PropTypes.string,
    throttle: PropTypes.number
  }

  static defaultProps = {
    container: 'div',
    onMeasure: () => {},
    throttle: 250
  }

  constructor(props) {
    super(props);
    this.node = null;
    this.observer = null;
    this.measure = throttle(this.measure, props.throttle);
    this.state = {};
  }

  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this);
    if (this.node) {
      this.initListeners();
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  initListeners() {
    window.addEventListener('resize', this.measure);
    window.addEventListener('scroll', this.measure);

    const observer_options = {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    };
    this.observer = new MutationObserver(this.measure);
    this.observer.observe(this.node, observer_options);
  }

  removeListeners() {
    window.removeEventListener('resize', this.measure);
    window.removeEventListener('scroll', this.measure);
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  measure = () => {
    const rect = this.node.getBoundingClientRect();
    const viewport_width = document.documentElement.clientWidth;
    const viewport_height = document.documentElement.clientHeight;
    this.handleMeasure({
      top: rect.top,
      bottom: viewport_height - rect.bottom,
      left: rect.left,
      right: viewport_width - rect.right,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top
    });
  }

  handleMeasure(value) {
    const new_value = JSON.stringify(value);
    if (this.last_value !== new_value) {
      this.props.onMeasure(value);
      this.last_value = new_value;
    }
  }

  render() {
    const { children, container: Container } = this.props;
    return Children.count(children) === 1 ? children : <Container>{children}</Container>;
  }
}
