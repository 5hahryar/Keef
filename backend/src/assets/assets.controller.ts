import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/current-user.decorator';
import { CreateAssetDto, CreateAssetTransactionDto, UpdateAssetDto } from './dto/asset.dto';
import { AssetsService } from './assets.service';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@ApiTags('assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}

  @Post()
  async createAsset(@CurrentUsername() username: string, @Body() asset: CreateAssetDto) {
    if (!asset) {
      throw new HttpException({ message: 'Request format is wrong!' }, HttpStatus.BAD_REQUEST);
    }
    const id = await this.assets.create(username, asset);
    return { id };
  }

  @Get()
  getAssets(@CurrentUsername() username: string) {
    return this.assets.findAll(username);
  }

  @Post('transactions')
  async createAssetTransaction(
    @CurrentUsername() username: string,
    @Body() transaction: CreateAssetTransactionDto,
  ) {
    if (!transaction) {
      throw new HttpException({ message: 'Request format is wrong!' }, HttpStatus.BAD_REQUEST);
    }
    const id = await this.assets.createTransaction(username, transaction);
    return { id };
  }

  @Get('transactions')
  getAssetTransactions(@CurrentUsername() username: string, @Query('assetId') assetId?: string) {
    if (assetId && !UUID_RE.test(assetId)) {
      throw new HttpException({ message: 'Invalid asset ID' }, HttpStatus.BAD_REQUEST);
    }
    return this.assets.findTransactions(username, assetId);
  }

  @Delete('transactions/:id')
  async deleteAssetTransaction(@CurrentUsername() username: string, @Param('id') id: string) {
    if (!UUID_RE.test(id)) {
      throw new HttpException({ message: 'Invalid transaction ID' }, HttpStatus.BAD_REQUEST);
    }
    await this.assets.removeTransaction(username, id);
    return { message: 'Transaction deleted successfully' };
  }

  @Get(':id')
  getAsset(@CurrentUsername() username: string, @Param('id') id: string) {
    if (!UUID_RE.test(id)) {
      throw new HttpException({ message: 'Invalid asset ID' }, HttpStatus.BAD_REQUEST);
    }
    return this.assets.findOne(username, id);
  }

  @Put(':id')
  async updateAsset(
    @CurrentUsername() username: string,
    @Param('id') id: string,
    @Body() updates: UpdateAssetDto,
  ) {
    if (!UUID_RE.test(id)) {
      throw new HttpException({ message: 'Invalid asset ID' }, HttpStatus.BAD_REQUEST);
    }
    if (!updates) {
      throw new HttpException({ message: 'Request format is wrong!' }, HttpStatus.BAD_REQUEST);
    }
    await this.assets.update(username, id, updates);
    return { message: 'Asset updated successfully' };
  }

  @Delete(':id')
  async deleteAsset(@CurrentUsername() username: string, @Param('id') id: string) {
    if (!UUID_RE.test(id)) {
      throw new HttpException({ message: 'Invalid asset ID' }, HttpStatus.BAD_REQUEST);
    }
    await this.assets.remove(username, id);
    return { message: 'Asset deleted successfully' };
  }
}
