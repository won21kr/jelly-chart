import RectLinear from '../rectLinear/';
import seriesMixin from '../seriesMixin';
import brushMixin from '../brushMixin';
import paddingMixin from '../paddingMixin';
import shapeMixin from '../shapeMixin';
import {genFunc, mix} from '../../modules/util';
import conditionForMute from '../core/_condtionForMute';
import _munge from './_munge';
import _domain from './_domain';
import _range from './_range';
import _mark from './_mark';
import _axis from './_axis';
import _legend from './_legend';
import _region from './_region';
import _facet from './_facet';
import _brush from './_brush';

const size = {range: [1,1], scale: 'linear', reverse: false};
const shapes = ['par-coords', 'scatter-matrix'];
const conditions = ['normal', 'color'];
const _attrs = {
  regionPadding: 0.1,
  size: size,
  shape: shapes[0]
};

/**
 * renders a parallel coordinates
 * @class ParCoords
 * @augments Core
 * @augments RectLinear
 * @augments SeriesMixin
 * @augments BrushMixin
 * @augments PaddingMixin
 * @augments ShapeMixin
 */
class ParCoords extends mix(RectLinear).with(seriesMixin, brushMixin, paddingMixin, shapeMixin) {
  constructor() {
    super();
    this.setAttrs(_attrs);
    this.brush(true);
    this.process('munge', _munge, {isPre: true})
      .process('domain', _domain, {isPre: true})
      .process('range', _range, {isPre: true})
      .process('axis', _axis)
      .process('region', _region) 
      .process('mark', _mark, {allow: function() {return this.isParcoords()}})
      .process('facet', _facet, {allow: function() {return !this.isParcoords()}})
      .process('legend', _legend)
      .process('brush', _brush);
  }

  isColor() {
    return this.condition() === conditions[1];
  }

  isParcoords() {
    return this.shape() === shapes[0];
  }
  
  muteRegions(callback) { 
    let _parCoords = region => {
      this.mute(region, this.muteIntensity());
    }
    let _matrix = region => {
      let nodes = region.selectAll(this.nodeName()).classed('mute', true);
      this.mute(nodes, this.muteIntensity());
    }
    if (!arguments.length) {
      if (this.isParcoords()) {
        return this.filterRegions().call(_parCoords);
      } else {  
        return this.regions().selectAll(this.regionName())  
          .call(_matrix);
      }
    } 
    if (this.isParcoords()) {
      return this.filterRegions(conditionForMute(callback), true).call(_parCoords);
    } else {
      return this.regions().selectAll(this.regionName()).filter(conditionForMute(callback)).call(_matrix);
    }
  }
  
  demuteRegions(callback) {
    let _parCoords = region => {
      this.demute(region);
    }
    let _matrix = region => {
      let nodes = region.selectAll(this.nodeName());
      this.demute(nodes);
    }
    if (!arguments.length) {
      if (this.shape() === shapes[0]) {
        return this.filterRegions().call(_parCoords);
      } else {  
        return this.regions().selectAll(this.regionName())  
          .call(_matrix);
      }
    }
    if (this.isParcoords()) {
      return this.filterRegions(conditionForMute(callback), true).call(_parCoords);
    } else {
      return this.regions().selectAll(this.regionName()).filter(conditionForMute(callback)).call(_matrix);
    }
  }
  
  muteFromLegend(legend) {
    this.muteRegions(legend.key);
  }
  
  demuteFromLegend(legend) {
    this.demuteRegions(legend.key);
  }
}

function xMeasureName (measure) {
  return 'x-' + (measure.field ? measure.field : measure);
}

function yMeasureName (measure) {
  return 'y-' + (measure.field ? measure.field : measure);
}

export default genFunc(ParCoords);
export {xMeasureName, yMeasureName, conditions, shapes};
