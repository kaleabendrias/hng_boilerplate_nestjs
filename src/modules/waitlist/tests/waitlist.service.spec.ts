import { Repository } from 'typeorm';
import { Waitlist } from '../entities/waitlist.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { de } from '@faker-js/faker';
import { request } from 'http';
import { CreateWaitlistDto } from '../dto/create-waitlist.dto';
import { WaitlistResponseDto } from '../dto/create-waitlist-response.dto';
import WaitlistService from '../waitlist.service';
import { HttpStatus } from '@nestjs/common';

describe('WaitlistService', () => {
  let waitlistRepository: Repository<Waitlist>;
  let mailerService: MailerService;
  let waitlistService: WaitlistService;

  const mockUserRepository = {
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitlistService,
        { provide: getRepositoryToken(Waitlist), useValue: mockUserRepository },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    waitlistService = module.get<WaitlistService>(WaitlistService);
    waitlistRepository = module.get<Repository<Waitlist>>(getRepositoryToken(Waitlist));
    mailerService = module.get<MailerService>(MailerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(waitlistService).toBeDefined();
  });

  describe('getAllWaitlist', () => {
    it('should return all waitlist', async () => {
      await waitlistService.getAllWaitlist();

      expect(waitlistRepository.find).toHaveBeenCalled();
    });
  });

  describe('createWaitlist', () => {
    it('should create a waitlist entry and send a confirmation email', async () => {
      const createWaitlistDto: CreateWaitlistDto = {
        full_name: 'John Doe',
        email: 'johndoe@gmail.com',
      };

      const saveSpy = jest.spyOn(waitlistRepository, 'save').mockResolvedValue(undefined);
      const sendMailSpy = jest.spyOn(mailerService, 'sendMail').mockResolvedValue(undefined);

      const result: WaitlistResponseDto = await waitlistService.createWaitlist(createWaitlistDto);

      expect(saveSpy).toHaveBeenCalled();
      expect(sendMailSpy).toHaveBeenCalledWith({
        to: createWaitlistDto.email,
        subject: 'Waitlist Confirmation',
        html: `<p>Hello John Doe,</p><p>Thank you for signing up for our waitlist! We will notify you once you are selected.</p>`,
      });
      expect(result).toEqual({ message: 'You are all signed up!' });
    });

    it('should return 400 Bad Request for invalid data', async () => {
      const createWaitlistDto: CreateWaitlistDto = {
        full_name: '',
        email: 'invalid-email',
      };

      try {
        await waitlistService.createWaitlist(createWaitlistDto);
      } catch (e) {
        expect(e.response).toEqual({
          status_code: HttpStatus.BAD_REQUEST,
          message: ['Name should not be empty', 'Email must be an email'],
        });
      }
    });
  });
});
