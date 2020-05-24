import React from "react";
import { Theme } from './';

export type TileProps =
{
  rank: number,
  onClick: () => void,
};

class Tile extends React.Component<TileProps>
{
  render()
  {
    return <div className={`tile ${this.tileClass()}`} onClick={this.props.onClick}>
      <img src={this.imageUrl()}
      style={this.generateStyle(this.props.rank)}
      alt={(this.props.rank+1).toString()}/></div>;
  }
  tileClass(): string
  {
    throw new TypeError("tileClass() is not implemented");
  }
  imageUrl(): string
  {
    throw new TypeError("imageUrl() is not implemented");
  }
  generateStyle(r: number): any{throw new TypeError("");}
}

class PostModernTile extends Tile
{
  generateStyle(r: number)
  {
    return {
        clip: `rect(${this.top(r)}, ${this.right(r)}, ${this.bottom(r)}, ${this.left(r)})`,
        top: -this.top(r),
        left: -this.left(r),
    };
  }
  tileClass()
  {
    return 'pm';
  }
  right(r: number): number{throw new TypeError("right() is not implemented");}
  left(r: number): number{throw new TypeError("left() is not implemented");}
  top(r: number){return 0;}
  bottom(r: number){return 88;}
  imageUrl()
  {
    return "postmodern.svg";
  }
}

class PostModernBamboos extends PostModernTile
{
  left(r: number){return (24+r)*64;}
  right(r: number){return (25+r)*64;}
}

class PostModernCharacters extends PostModernTile
{
  left(r: number){return (15+r)*64;}
  right(r: number){return (16+r)*64;}
}

class PostModernDots extends PostModernTile
{
  left(r: number){return (0+r)*64;}
  right(r: number){return (1+r)*64;}
}

class GLMahjongTile extends Tile
{
  suit(): string{throw new TypeError("suit() is not implemented");}
  imageUrl()
  {
    return `gl-mahjongtile-svg/${this.suit()}-${this.props.rank}.svg`;
  }
  tileClass()
  {
    return 'gl';
  }
  generateStyle(r: number)
  {
    return {
      transform: 'scale(1, -1)',
    };
  }
}

class GLMahjongTileBamboos extends GLMahjongTile
{
  suit()
  {
    return 'b';
  }
}

class GLMahjongTileCharacters extends GLMahjongTile
{
  suit()
  {
    return 'c';
  }
}

class GLMahjongTileDots extends GLMahjongTile
{
  suit()
  {
    return 'd';
  }
}

export function tileClass(theme: Theme): React.ComponentClass<TileProps>
{
  switch (theme.tileStyle)
  {
    case 'PostModern': switch (theme.tileSuit)
    {
      case 'bamboos': return PostModernBamboos;
      case 'characters': return PostModernCharacters;
      case 'dots': return PostModernDots;
    }
    case 'GLMahjongTile': switch (theme.tileSuit)
    {
      case 'bamboos': return GLMahjongTileBamboos;
      case 'characters': return GLMahjongTileCharacters;
      case 'dots': return GLMahjongTileDots;
    }
  }
}
